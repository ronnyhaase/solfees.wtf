import { SolFeesApp } from "@/components/SolFeesApp"

export const metadata = {
	metadataBase: new URL("https://www.solfees.fyi"),
	title: "solfees.fyi",
	description:
		"Check how much you've spent on Solana transaction fees across all your wallets.",
	openGraph: {
		title: "solfees.fyi",
		description:
			"Check how much you've spent on Solana transaction fees across all your wallets.",
		url: "/",
		siteName: "solfees.fyi",
		images: [
			{
				url: "/solfeesfyi.jpeg",
				width: 700,
				height: 350,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "solfees.fyi",
		description:
			"Check how much you've spent on Solana transaction fees across all your wallets.",
		creator: "@ronnyhaase",
		images: ["/solfeesfyi.jpeg"],
	},
}

export default function Home() {
	return (
		<>
			<SolFeesApp />
		</>
	)
}
