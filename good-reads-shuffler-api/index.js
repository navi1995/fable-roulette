const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

app.get("/api/good-reads-books/:username/:shelf", async (req, res) => {
	const { username, shelf } = req.params;

	try {
		const books = await scrapeGoodreadsShelf(username, shelf);
		res.json(books);
	} catch (error) {
		console.error("Error:", error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
});

async function scrapeGoodreadsShelf(username, shelf) {
	try {
		let page = 1;
		let books = [];
		let hasNextPage = true;
		let highestPage = 99;
		let highestPageFetched = false;
		const maxConcurrency = 5; // Adjust the concurrency level as needed

		while (hasNextPage) {
			const pagesToFetch = Math.min(maxConcurrency, highestPage - page + 1);

			if (pagesToFetch === 0) break;
			const requests = [];

			// Create an array of promises for fetching pages concurrently
			for (let i = 0; i < pagesToFetch; i++) {
				const url = `https://www.goodreads.com/review/list/${username}?page=${page}&shelf=${shelf}`;
				requests.push(axios.get(url));
				page++;
			}

			const responses = await Promise.all(requests);
			for (const response of responses) {
				const $ = cheerio.load(response.data);
				const pageBooks = $(".bookalike");

				if (!highestPageFetched) {
					const highestPageLink = $("#reviewPagination")
						.first()
						.find(".next_page")
						.prev("a")
						.text();
					highestPage = parseInt(highestPageLink) || 1;
					highestPageFetched = true;
				}

				if (pageBooks.length === 0 || highestPage === 1) {
					hasNextPage = false;
					console.log("No more pages");
				}

				pageBooks.each((index, element) => {
					const title = $(element)
						.find(".title")
						.find(".value a")
						.attr("title")
						.trim();
					const author = $(element)
						.find(".author")
						.find(".value a")
						.text()
						.trim();
					const rating = $(element)
						.find(".avg_rating")
						.find(".value")
						.text()
						.trim();
					let imageUrl = $(element)
						.find(".js-tooltipTrigger")
						.find("img")
						.attr("src");

					if (imageUrl)
						imageUrl = imageUrl.replace("._SX50_SY75_", "").replace("._SX50_", "").replace("._SY75_", "");

					const book = { title, author, rating, imageUrl };
					books.push(book);
					console.log(books.length);
				});
			}
		}

		console.log(books.length);
		return books;
	} catch (error) {
		console.error("Error scraping Goodreads shelf:", error);
		throw error;
	}
}

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});