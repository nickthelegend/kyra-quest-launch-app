async function main(hre) {
    console.log("HRE received as argument:", !!hre);
    if (hre) {
        console.log("HRE keys:", Object.keys(hre));
        const { ethers } = hre;
        console.log("ethers in argument HRE:", !!ethers);
    }

    // fallback to import
    const hardhat = await import("hardhat");
    console.log("hardhat import keys:", Object.keys(hardhat));
    if (hardhat.default) {
        console.log("hardhat.default keys:", Object.keys(hardhat.default));
    }
}

main(global.hre)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
