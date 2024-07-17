const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { secp256k1 } = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
	// Private Key:  542e062ee07f4bcfd87b879cc22a2a6f2e4ca18f52053a960637011348194574
	"0280ab045dafdbdb8e9837b3b594ee9914e9e008b38af3b5f23032a54d96557491": 100,

	// Private Key:  eb6c408c88e2a9756962c0f3c1652d63e46e59271fc8db8ecf9550e2a3ac36e3
	"0313c14eb0f47799d5a843ec80f5198d8024f08e938855191a07885f2298fc1f7e": 200,

	// Private Key:  e9972c7cbf1f231b39a45052cacf23762fd5fab738d7b808b555ec796d94081a
	"0386b852c56da6c98a5a594c549b4ec7d4a0e11533086614a1aaf01ad44f008aeb": 300,
};

app.get("/balance/:address", (req, res) => {
	const { address } = req.params;
	const balance = balances[address] || 0;
	res.send({ balance });
});

app.post("/send", async (req, res) => {
	// TODO: get a signature from the client-side application
	// recover the public address from the signature

	const { sender, recipient, amount, signature } = req.body;

	if (!signature) {
		res.status(404).send({ message: "signature was not provided!" });
	}

	const { r, s, recovery } = signature;
	const sig = new secp256k1.Signature(BigInt(r), BigInt(s), recovery);

	// recoverying public key
	const msg = {
		sender,
		recipient,
		amount,
	};
	const bytes = utf8ToBytes(JSON.stringify(msg));
	const hash = keccak256(bytes);

	const publicKey = sig.recoverPublicKey(hash).toHex();

	if (publicKey != sender) {
		console.log("publicKey:", publicKey);
		res.status(400).send({ message: "signature is not valid!" });
	}

	setInitialBalance(sender);
	setInitialBalance(recipient);
	if (balances[sender] < amount) {
		res.status(400).send({ message: "Not enough funds!" });
	} else {
		balances[sender] -= amount;
		balances[recipient] += amount;
		res.send({ balance: balances[sender] });
	}
});

app.listen(port, () => {
	console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
	if (!balances[address]) {
		balances[address] = 0;
	}
}

function getAddress(publicKey) {
	const rest = publicKey.slice(1);
	const hash = keccak256(rest);
	return hash.slice(-20);
}
