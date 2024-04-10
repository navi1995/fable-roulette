const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

app.get("/api/ping", async(req, res) => {
	res.status(200).send("pong");
})

app.get("/api/fable-books/:username", async (req, res) => {
	const { username } = req.params;
	const listName = "want_to_read";
	console.log("New request");

	try {
		const books = await getFableBooksFromList(username, listName);
		res.json(books);
	} catch (error) {
		console.error("Error:", error);
		return res.status(500).json({ error: "Internal Server Error" });
	}
});

async function getFableBooksFromList(username, listName) {
	try {
		// Query to fetch user ID
        const userResponse = await axios.get(`https://api.fable.co/api/usernames/${username}`);
        const userID = userResponse.data.id;

        // Query to fetch user's book lists
        const bookListsResponse = await axios.get(`https://api.fable.co/api/v2/users/${userID}/book_lists/?limit=20&offset=0`);
        const wantToReadList = bookListsResponse.data.results.find(list => list.system_type === "want_to_read");
        if (!wantToReadList) {
            throw new Error("No 'want_to_read' list found.");
        }
        const listID = wantToReadList.id;
		const count = wantToReadList.count;
		const randomOffset = Math.floor(Math.random() * count);

		// Query to fetch books from the list
		const booksResponse = await axios.get(`https://api.fable.co/api/v2/users/${userID}/book_lists/${listID}/books?limit=1&offset=${randomOffset}`);
		const book = booksResponse.data.results[0].book;

		// Query direct book winner API 
		const bookResponse = await axios.get(`https://api.fable.co/api/books/${book.isbn}/`);
		const bookData = bookResponse.data.response;

		return {
			title: bookData.title,
			author: bookData.authors.map(author => author.name).join(', '),
			imageUrl: bookData.cover_image,
			rating: bookData.review_average.toFixed(2)
		}
	} catch (error) {
		console.error("Error getting book:", error);
		throw error;
	}
}

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});