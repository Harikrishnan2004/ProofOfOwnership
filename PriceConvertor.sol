pragma solidity ^0.8.0;
//SPDX-License-Identifier: UNLICENSED

import {AggregatorV3Interface} from "@chainlink/contracts/v0.8/shared/interfaces/AggregatorV3Interface.sol";

library PriceConvertor{
    function getPrice() internal view returns(uint256){
        AggregatorV3Interface latestPrice = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        (, int256 answer, , ,) = latestPrice.latestRoundData();
        return uint(answer * 1e10);
    }

    function getConversionRate(uint _ethAmount) internal view returns(uint256){
        uint256 ethPrice = getPrice();
        uint256 ethAmountInUsd = (ethPrice * _ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}