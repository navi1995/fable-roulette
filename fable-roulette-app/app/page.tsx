"use client";
import { Button } from "@nextui-org/button";
import { Image } from "@nextui-org/image";
import { title, subtitle } from "@/components/primitives";
import { Input } from "@nextui-org/input";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { useEffect, useState } from "react";
import { useSearchParams } from 'next/navigation'
import {Spinner} from "@nextui-org/react";
import Confetti from 'react-confetti-boom';

export default function Home() {
	const searchParams = useSearchParams() 
	const [book, setBook] = useState<any>();
	const [username, setUsername] = useState(searchParams.get('username') || "");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(false);
	const urlPrefix = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/";

	useEffect(() => {
		setUsername(searchParams.get('username') || "");
	}, [searchParams.get('username')]);

	const handleSearch = async () => {
		setBook(undefined);
		setIsLoading(true);
		setError(false);
		const response = await fetch(`${urlPrefix}fable-books/${username}`);
  
		if (!response.ok) {
			console.log("error");
			setError(true);
			setIsLoading(false);
			return;
		}
		
		const data = await response.json();
		setBook(data);
		setIsLoading(false);
	} 

	return (
		<section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
			<div className="inline-block max-w-lg text-center justify-center">
				<h1 className={title()} style={{textDecoration: "line-through"}}>GoodReads&nbsp;</h1>
				<h1 className={title()}>Fable&nbsp;</h1>
				<h1 className={title({ color: "green" })}>Roulette&nbsp;</h1>
				<br />
				<h2 className={subtitle({ class: "mt-4" })}>
					Enter your Username below, and click the button!
				</h2>
				<h2 className={subtitle({ class: "mt-4" })}>
					A random book from your to-read list gets picked.
				</h2>
				<br />
				<Input
					aria-label="Search"
					classNames={{
						inputWrapper: "bg-default-100",
						input: "text-sm",
					}}
					labelPlacement="outside"
					placeholder="Fable Username (Format johnd-512344179594)"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<br />
				<Button					
					// className={buttonStyles({ color: "primary", radius: "full", variant: "shadow" })}
					className="bg-gradient-to-tr from-[#2dff6e] to-[#0f9669] text-black font-semibold w-full shadow-lg"
					onClick={handleSearch}
				>
					Random Book
				</Button>
			</div>

			{isLoading && (
				<Card className="col-span-12 sm:col-span-4">
					<div className="z-0 object-cover" style={{width: "450px", height: "675px"}}>
						<Spinner label="Loading your book!" style={{ height: "100%", width: "100%" }} size="lg" color="success" />
					</div>
				</Card>
			)}
			{error && (
				<Card className="col-span-12 sm:col-span-4" style={{width: "450px", height: "675px"}}>
					<CardBody style={{ textAlign: "center", justifyContent: "center" }}>
						Something went wrong :( <br />
						Try again after a break.		
					</CardBody>
				</Card>
			)}
			{book && (
				<>
				<h4 className="font-medium text-large">{book.title}</h4>
				<p className="text-tinyfont-bold">By {book.author}</p>
				<small className="">Rating: {book.rating}</small>
				<Confetti mode="boom" particleCount={500}/>
				<Card className="col-span-12 sm:col-span-4 z-0" isFooterBlurred>
					<Image						
						src={book.imageUrl}
						className="z-0 object-cover" //z-0 w-full h-full object-cover"
						alt={book.title}
						width="450px"
					>
					</Image>
				</Card>
				</>
			)}
		</section>
	);
}
