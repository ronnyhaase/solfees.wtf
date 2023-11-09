import { Transition } from "@headlessui/react"
import BigNumber from "bignumber.js"
import clx from "classnames"
import { usePlausible } from "next-plausible"
import { useMemo, useState } from "react"
import { IoGitCompare, IoInformationCircle } from "react-icons/io5"
import { MdPlaylistAdd, MdSkipPrevious } from "react-icons/md"

import { Button, NoWrap, U } from "@/components/atoms"
import { GAS_DENOMINATOR, TX_CAP } from "@/constants"
import { Comparer } from "@/components/molecules"

const generateTweetMessage = (feesUsd, feesSol, transactions, wallets) =>
	`I spent only ${
		feesUsd ? `$${feesUsd} (◎ ${feesSol})` : `◎ ${feesSol}`
	} in fees for all of my ${transactions} Solana transactions${
		wallets > 1 ? ` across ${wallets} wallets` : ""
	}${
		feesUsd ? " at the current SOL price" : ""
	}!%0A%0A%23OnlyPossibleOnSolana%0A%0ACheck yours at https://www.solfees.fyi by %40solfees_fyi`

const Result = ({
	addWallet,
	className,
	pricesAndFees,
	reset,
	summary,
	wallets,
}) => {
	const plausible = usePlausible()
	const data = useMemo(() => {
		let data = {}
		if (summary) {
			data = {
				firstTransaction: new Intl.DateTimeFormat(undefined, {
					year: "numeric",
					month: "numeric",
					day: "numeric",
					hour: "numeric",
					minute: "numeric",
					second: "numeric",
					hour12: false,
				}).format(new Date(summary.firstTransactionTS)),
				solFees: new BigNumber(summary.feesTotal)
					.multipliedBy(GAS_DENOMINATOR)
					.decimalPlaces(5)
					.toNumber(),
				txCount: summary.transactionsCount,
				txCountUnpaid: summary.unpaidTransactionsCount,
				solAvgFee: new BigNumber(summary.feesAvg)
					.multipliedBy(GAS_DENOMINATOR)
					.decimalPlaces(6)
					.toNumber(),
			}
		}
		if (pricesAndFees && summary) {
			data.usdFees = new BigNumber(summary.feesTotal)
				.multipliedBy(GAS_DENOMINATOR)
				.multipliedBy(pricesAndFees.prices.solana)
				.decimalPlaces(2)
				.toNumber()
			data.usdAvgFee = new BigNumber(summary.feesAvg)
				.multipliedBy(GAS_DENOMINATOR)
				.multipliedBy(pricesAndFees.prices.solana)
				.decimalPlaces(6)
				.toNumber()
		}

		return data
	}, [summary, pricesAndFees])

	const [showComparer, setShowComparer] = useState(false)
	const handleCompareClick = () => {
		plausible("Compare")
		setShowComparer(true)
		window.scrollBy({ behavior: "smooth", top: 200 })
	}

	const handleCompareChainChange = (ev) => {
		plausible("Compare change", {
			props: {
				Chain: ev.target.value[0].toUpperCase() + ev.target.value.slice(1),
			},
		})
	}
	const handleAddWalletClick = () => {
		plausible("Add wallet")
		addWallet()
	}
	const handleResetClick = () => {
		plausible("Reset")
		reset()
	}
	const handleTweetClick = () => {
		plausible("Share click", { props: { Target: "X / Twitter" } })
	}

	const tweetMessage = generateTweetMessage(
		data.usdFees,
		data.solFees,
		data.txCount,
		wallets.length,
	)

	return (
		<div className={className}>
			{data.txCount >= TX_CAP ? (
				<p className="flex justify-center items-center mb-2 leading-tight text-blue-500 text-base">
					<IoInformationCircle className="inline mr-2" size={32} />
					<span>
						We&apos;re currently stopping at {TX_CAP} transactions, sorry!
					</span>
				</p>
			) : null}
			{pricesAndFees === null ? (
				<p className="flex justify-center items-center mb-2 leading-tight text-blue-500 text-base">
					<IoInformationCircle className="inline mr-2" size={32} />
					<span>
						Crypto prices and EVM gas data are currently unavailable. &#58;&#40;
					</span>
				</p>
			) : null}
			<p className="my-2 text-xl md:text-2xl text-center">
				{wallets.length > 1 ? (
					<>
						Across your{" "}
						<span className="text-solana-purple">{wallets.length} wallets</span>{" "}
						you have spent{" "}
					</>
				) : (
					<>Your wallet has spent </>
				)}
				<NoWrap className="text-solana-purple">◎ {data.solFees} </NoWrap>
				in fees for{" "}
				<span className="text-solana-purple">{data.txCount} transactions</span>.
			</p>
			{data.usdFees ? (
				<p className="mb-4 text-xl md:text-2xl text-center">
					<U>Right now</U>, that&apos;s{" "}
					<NoWrap className="text-solana-purple">$ {data.usdFees}</NoWrap>.
				</p>
			) : null}
			<div className="mt-2">
				<p className="mb-2">
					You paid for {data.txCount - data.txCountUnpaid} of the {data.txCount}
					&nbsp;transactions. On average, you paid{" "}
					<NoWrap>◎ {data.solAvgFee}</NoWrap>{" "}
					{data.usdAvgFee ? <NoWrap>($ {data.usdAvgFee})</NoWrap> : null} per
					transaction.
				</p>
				<p className="mb-4">
					The very first transaction was sent on {data.firstTransaction}
				</p>
			</div>
			<Transition
				enter="duration-200 ease-in transition-opacity"
				enterFrom="opacity-0"
				enterTo="opacity-100"
				show={showComparer}
			>
				<Comparer
					onChainChange={handleCompareChainChange}
					pricesAndFees={pricesAndFees}
					txCount={data.txCount - data.txCountUnpaid}
				/>
			</Transition>
			<div className="flex gap-1 justify-center mb-1">
				<Button color="primary" size="sm" onClick={handleResetClick}>
					<MdSkipPrevious size={20} />
					Restart
				</Button>
				<Button color="primary" size="sm" onClick={handleAddWalletClick}>
					<MdPlaylistAdd size={20} />
					Add Wallet
				</Button>
				<Transition show={!showComparer} className="hidden sm:block">
					<Button
						size="sm"
						disabled={pricesAndFees === null}
						onClick={handleCompareClick}
					>
						<IoGitCompare size={20} />
						Compare Chains
					</Button>
				</Transition>
			</div>
			<Transition
				show={!showComparer}
				className="flex sm:hidden justify-center"
			>
				<Button
					size="sm"
					disabled={pricesAndFees === null}
					onClick={handleCompareClick}
				>
					<IoGitCompare size={20} />
					Compare Chains
				</Button>
			</Transition>
			<p
				className={clx(
					"my-6 md:my-10",
					"font-light",
					"text-solana-purple",
					"text-2xl md:text-4xl",
					"text-center",
					"tracking-tight",
				)}
			>
				#OnlyPossibleOnSolana
			</p>
			<div className="text-center">
				<a
					className={clx(
						"block sm:inline-flex",
						"bg-[#0C9DED]",
						"px-8",
						"py-4",
						"rounded-full",
						"text-lg",
						"text-white",
					)}
					href={`https://twitter.com/share?text=${tweetMessage}`}
					target="_blank"
					referrerPolicy="origin"
					onClick={handleTweetClick}
				>
					Tweet it
				</a>
			</div>
		</div>
	)
}

export { Result }