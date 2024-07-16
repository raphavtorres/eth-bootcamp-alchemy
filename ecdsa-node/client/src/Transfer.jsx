import { useState } from "react";
import server from "./server";

import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance, privateKey }) {
	const [sendAmount, setSendAmount] = useState("");
	const [recipient, setRecipient] = useState("");

	const setValue = (setter) => (evt) => setter(evt.target.value);

	async function transfer(evt) {
		evt.preventDefault();

		const msg = {
			sender: address,
			recipient,
			amount: parseInt(sendAmount),
		};
		const bytes = utf8ToBytes(JSON.stringify(msg));
		const hash = keccak256(bytes);

		const signature = secp256k1.sign(hash, privateKey);

		BigInt.prototype.toJSON = function () {
			return this.toString();
		};

		try {
			const {
				data: { balance },
			} = await server.post(`send`, {
				...msg,
				signature,
			});
			setBalance(balance);
		} catch (ex) {
			alert(ex.response.data.message);
		}
	}

	return (
		<form className="container transfer" onSubmit={transfer}>
			<h1>Send Transaction</h1>

			<label>
				Send Amount
				<input
					placeholder="ETH"
					value={sendAmount}
					onChange={setValue(setSendAmount)}
				></input>
			</label>

			<label>
				Recipient
				<input
					placeholder="Type an address, for example: 0x2"
					value={recipient}
					onChange={setValue(setRecipient)}
				></input>
			</label>

			<input type="submit" className="button" value="Transfer" />
		</form>
	);
}

export default Transfer;
