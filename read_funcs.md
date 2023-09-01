# Read Functions

- startTime

args : address, depositNumber
returns : Start time of the particular deposit

- endTime

args : address, depositNumber
returns : Start time of the particular deposit

- userDepositAmount

args : address, depositNumber
returns : Deposit amount in that particular deposit

- yieldClaimDetails

args : depositNumber
returns :

```txt
balance : The balance of the particular deposit
totalYield : Total yield that will be generated from deposit
unlockedYield : Yield Unlocked till date
lockedYield : Locked Yield till date
cyclesLeft : Cycles left to claim the yield
timeLeft : Time left for the tenure to end
cyclesElapsed : Number of cycles elapsed till date
nextTransferTime : Time at which next yield can be claimed
```
