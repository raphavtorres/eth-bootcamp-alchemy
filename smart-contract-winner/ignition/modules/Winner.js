const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const CONTRACT_ADDR = "0xbF20E2b16125fcAdB5B63E8677ac93Fb23C0811f";

module.exports = buildModule("WinnerModule", (m) => {
	const winner = m.contract("Winner", []);

	const existingContract = m.contractAt("Contract", CONTRACT_ADDR);

	m.call(winner, "callWin", [existingContract]);

	return { winner };
});
