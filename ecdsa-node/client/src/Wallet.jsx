import server from "./server";

import { secp256k1 } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { toHex } from "ethereum-cryptography/utils";

function Wallet({
	address,
	setAddress,
	balance,
	setBalance,
	privateKey,
	setPrivateKey,
}) {
	async function onChange(evt) {
		const privateKey = evt.target.value;
		setPrivateKey(privateKey);

		const publicKey = secp256k1.getPublicKey(privateKey);
		const _address = toHex(publicKey);

		setAddress(_address);

		if (_address) {
			const {
				data: { balance },
			} = await server.get(`balance/${_address}`);
			setBalance(balance);
		} else {
			setBalance(0);
		}
	}

	return (
		<div className="container wallet">
			<h1>Your Wallet</h1>

			<label>
				Private Key
				<input
					placeholder="Type in a privatekey"
					value={privateKey}
					onChange={onChange}
				></input>
			</label>
			<div>Address: {address}</div>

			<div className="balance">Balance: {balance}</div>
		</div>
	);
}

export default Wallet;
