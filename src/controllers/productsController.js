const db = require('../database/models');
const {validationResult} = require('express-validator')
const {loadProducts,storeProducts} = require('../data/dbModule');
const { sendSequelizeError, createError, createErrorExpress } = require('../helpers');
const { literal, Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const getOptions = (req) => {
	return {
		include : [
			{
				association : 'images',
				attributes : {
					exclude : ['createdAt','updatedAt', 'deletedAt', 'productId'],
					include : [[literal(`CONCAT('${req.protocol}://${req.get('host')}/products/image/',file)`),'url']]
				}
			},
			{
				association : 'category',
				attributes : ['name']
			}
		]
	}
	
}

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
	
			const product = await db.Product.findByPk(id, getOptions(req));

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
	store: async (req, res) => {
		// Do the magic
		try {

			let errors = validationResult(req);

			if(!errors.isEmpty()){
				throw createErrorExpress(errors, req)
			}
			
			const {name, price, discount, description, category} = req.body;

			const product = await db.Product.create({
				name : name.trim(),
				price,
				discount,
				description : description.trim(),
				categoryId : category
			});


			if(req.files && req.files.length){
				let images = req.files.map(file => {
					return {
						file : file.filename,
						productId : product.id
					}
				});
				
				await db.Image.bulkCreate(images, {
					validate : true
				})
			}

			await product.reload(getOptions(req))

			return res.status(201).json({
				ok : true,
				data : product
			});


		} catch (error) {
			console.log(error)
            return res.status(error.status || 500).json({
                ok: false,
                errors : error.message,
            });
		}
	},
	// Update - Method to update
	update: async (req, res) => {
		// Do the magic
		try {

			let errors = validationResult(req);

			if(!errors.isEmpty()){
				throw createErrorExpress(errors, req)
			}

			const {name, price,discount, description, category} = req.body;

			const product = await db.Product.findByPk(req.params.id, getOptions(req));

			product.name = name.trim() || product.name;
			product.price = price || product.price;
			product.discount = discount || product.discount;
			product.description = description.trim() || product.description;
			product.categoryId = category || product.categoryId;

			let updated = await product.save();

			if(req.files && req.files.length){
				req.files.forEach(async (file, index) => {
					if(product.images[index]){
						fs.existsSync(path.join(__dirname,'..','..','public','images','products',product.images[index].file)) && fs.unlinkSync(path.join(__dirname,'..','..','public','images','products',product.images[index].file))

						product.images[index].file = file.filename;
						product.images[index].dataValues.url = `${req.protocol}://${req.get('host')}/products/image/${file.filename}`
						await product.images[index].save();


						/* product.images[index] = {
							...product.images[index],
							url :  `${req.protocol}://${req.get('host')}/products/image/${file.filename}`
						} */

						//console.log(product.images[index]);
					}
				});
			}

			return res.status(201).json({
				ok : true,
				data : product,
				updated
			});
			
		} catch (error) {
			console.log(error)
            return res.status(error.status || 500).json({
                ok: false,
                errors : error.message,
            });
		}

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