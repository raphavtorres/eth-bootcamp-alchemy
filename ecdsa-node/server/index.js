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
	// Private Key:  aecee8dad20dc681827199969b9e691c50735e04a8dd97af4eee139f8de4c4d0
	// Public Key:  039a197048f19c423c48baacbf22049636c1b91bbcdf087310b3ff7ebb1da8f6ef
	"039a197048f19c423c48baacbf22049636c1b91bbcdf087310b3ff7ebb1da8f6ef": 100,

	// Private Key:  fce4ad60c36a6c31cb3181acf59f4e48f8f464910aa01195a151f237436ffd1d
	// Public Key:  03468c3d9250b0a892234b9c1a297e8bd9a0a02b406608dd1c65acc5b037e818b9
	"039a197048f19c423c48baacbf22049636c1b91bbcdf087310b3ff7ebb1da8f6ef": 200,

	// Private Key:  7e4a76ea45b8837a008f3be26edcb9fc1cf6801e694b5b6a86656e4aa303acdb
	// Public Key:  03cb5928f26fed2a8c268393e329423350019c9d733029725a68135c33b2d73b31
	"039a197048f19c423c48baacbf22049636c1b91bbcdf087310b3ff7ebb1da8f6ef": 300,
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
