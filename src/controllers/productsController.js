const db = require('../database/models');

const {loadProducts,storeProducts} = require('../data/dbModule');
const { sendSequelizeError } = require('../helpers');
const { literal } = require('sequelize');
const path = require('path');

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
	// Root - Show all products
	list: async (req, res) => {

		try {

			let {limit} = req.query;

			let options = {
				attributes : {
					exclude : ['createdAt', 'updatedAt','deletedAt'],
					include : [[literal(`CONCAT('${req.protocol}://${req.get('host')}/products/',Product.id)`),'url']]
				},
				include : [
					{
						association : 'images',
						attributes : {
							exclude : ['createdAt','updatedAt', 'deletedAt', 'id', 'file', 'productId'],
							include : [[literal(`CONCAT('${req.protocol}://${req.get('host')}/products/image/',file)`),'url']]
						}
					},
					{
						association : 'category',
						attributes : ['name']
					}
				],
				limit : +limit || 4
			}

			const {count, rows : products} = await db.Product.findAndCountAll(options);

			return res.status(200).json({
				ok : true,
				meta : {
					total : count,
					quantity : products.length
				},
				data : products
			})


		} catch (error) {
			let errors = sendSequelizeError(error);

            return res.status(error.status || 500).json({
                ok: false,
                errors,
            });
		}

	},
	
	// Detail - Detail from one product
	detail: async (req, res) => {

		try {

			const {id} = req.params;
			const options = {
				include : [
					{
						association : 'images',
						attributes : {
							exclude : ['createdAt','updatedAt', 'deletedAt', 'id', 'file', 'productId'],
							include : [[literal(`CONCAT('${req.protocol}://${req.get('host')}/products/image/',file)`),'url']]
						}
					},
					{
						association : 'category',
						attributes : ['name']
					}
				]
			}

			const product = await db.Product.findByPk(id, options);

			return res.status(200).json({
				ok : true,
				data : product
			})
			
		} catch (error) {
			let errors = sendSequelizeError(error);

            return res.status(error.status || 500).json({
                ok: false,
                errors,
            });
		}
		
		db.Product.findByPk(req.params.id,{
			include : [{all : true}]
		})
			.then(product => {
				return res.render('detail', {
			product,
			toThousand
			})
			})
			.catch(error => console.log(error))
		
	},

	// Create -  Method to store
	store: (req, res) => {
		// Do the magic
		const {name, price,discount, description, category} = req.body;

		db.Product.create({
			name : name.trim(),
			price,
			discount,
			description,
			categoryId : category
		})
			.then(product => {
				return res.redirect('/products/detail/' + product.id)
			})
			.catch(error => console.log(error))
		
	},
	// Update - Method to update
	update: (req, res) => {
		// Do the magic
		const {name, price,discount, description, category} = req.body;
		let productsModify = loadProducts().map(product => {
			if(product.id === +req.params.id){
				return {
					id : product.id,
					name : name.trim(),
					price : +price,
					description : description.trim(),
					discount : +discount,
					category,
					image : product.image
				}
			}
			return product
		});

		storeProducts(productsModify);
		return res.redirect('/products/detail/' + req.params.id)
	},

	// Delete - Delete one product from DB
	destroy : (req, res) => {
		// Do the magic
		let productsModify = loadProducts().filter(product => product.id !== +req.params.id);
		
		storeProducts(productsModify);
		return res.redirect('/products')

	},
	getImage : async (req,res) => {
		return res.sendFile(path.join(__dirname, '..','..','public','images','products', req.params.image ))

	}
};

module.exports = controller;