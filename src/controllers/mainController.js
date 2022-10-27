const db = require("../database/models");

const { loadProducts } = require("../data/dbModule");
const { Op } = require("sequelize");

const toThousand = (n) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
	index: (req, res) => {
	
		return res.render("index");
		
	},
	search: (req, res) => {
		// Do the magic
		let { keywords } = req.query;

		db.Product.findAll({
			where: {
				[Op.or]: [
					{
						name: {
							[Op.substring]: keywords,
						},
					},
					{
						description: {
							[Op.substring]: keywords,
						},
					},
				],
			},
			include: ["images"],
		})
			.then((result) => {
				return res.render("results", {
					result,
					toThousand,
					keywords,
				});
			})
			.catch((error) => console.log(error));
	},
};

module.exports = controller;
