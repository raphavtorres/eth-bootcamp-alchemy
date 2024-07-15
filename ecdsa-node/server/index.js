const { utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
	"0x1": 100,
	"0x2": 50,
	"0x3": 75,
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

	const publicKey = signature.recoverPublicKey(hash).toHex();

	if (getAddress(publicKey) != sender) {
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
