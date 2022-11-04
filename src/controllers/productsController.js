const db = require('../database/models');

const {loadProducts,storeProducts} = require('../data/dbModule');
const { sendSequelizeError } = require('../helpers');
const { literal, Op } = require('sequelize');
const path = require('path');

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
	// Root - Show all products
	list: async (req, res) => {

		try {

			let {limit = 4, page = 1, order = 'ASC', sortBy = 'id', search = "", sale = 0} = req.query;

			/* paginación */
			limit = limit > 16 ? 16 : +limit;
			page = +page;
			let offset = +limit * (+page - 1);

			/* ordenamiento */
			order = ['ASC','DESC'].includes(order.toUpperCase()) ? order : 'ASC';
			sortBy =  ['name', 'price', 'discount', 'category', 'newest'].includes(sortBy.toLowerCase()) ? sortBy : 'id';

			let orderQuery = sortBy === "category" ? ['category','name',order] : sortBy === "newest" ? ['createdAt', 'DESC'] : [sortBy, order]

			let options = {
				subQuery:false,
				limit,
				offset,
				order : [orderQuery],
				include : [
					{
						association : 'images',
						attributes : {
							exclude : ['createdAt','updatedAt', 'deletedAt', 'id', 'file', 'productId'],
							include : [[literal(`CONCAT('${req.protocol}://${req.get('host')}/products/image/',file)`),'url']]
						},
					},
					{
						association : 'category',
						attributes : ['name','id'],
						
					}
				],
				attributes : {
					exclude : ['createdAt', 'updatedAt','deletedAt'],
					include : [[literal(`CONCAT('${req.protocol}://${req.get('host')}/products/',Product.id)`),'url']]
				},
				where : {
					[Op.or] : [
						{
							name : {
								[Op.substring] : search
							}
						},
						{
							description : {
								[Op.substring] : search
							}
						},
						{
							"$category.name$" : {
								[Op.substring] : search
							}
						}
					],
					[Op.and] : [
						{
							discount : {
								[Op.gte] : sale
							}
						}
					]
				}
				
			
			}

			const {count, rows : products} = await db.Product.findAndCountAll(options);


			const queryKeys = {
				limit,
				order,
				sortBy,
				search,
				sale
			}

			let queryUrl = "";

			for (const key in queryKeys) {

				queryUrl += `&${key}=${queryKeys[key]}`
			
			}


			const existPrev = page > 1;
			const existNext = offset + limit < count;

			const prev =  existPrev ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page - 1}${queryUrl}` : null;
			const next = existNext ? `${req.protocol}://${req.get('host')}${req.baseUrl}?page=${page + 1}${queryUrl}` : null;

			return res.status(200).json({
				ok : true,
				meta : {
					total : count,
					quantity : products.length,
					page,
					prev, 
					next
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