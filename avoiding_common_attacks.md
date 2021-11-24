# Avoiding common attacks

## [SWC-103] Using Specific Compiler Pragma
P2PLoan contracts pragma is set to `0.8.4`. Locking the pragma helps to ensure that contracts do not accidentally get deployed using, for example, an outdated compiler version that might introduce bugs that affect the contract system negatively.

## [SWC-107] Checks-Effects-Interactions
All functions are implemented with Checks-Effects-Interactions cycle in mind. All state modifications are made before calling external functions except for `claim` function. This function deletes and burns loan token after transferring paid credit or collateral to a loan token owner. It's because loan and offer data are needed to transfer assets to owner. Nevertheless loan state is changed to `Dead` before calling external functions, effectively preventing from re-entrancy attack.
