import axios from 'axios';
import schedule from 'node-schedule';
import date from 'date-and-time';
import express from 'express';
import { db } from "./firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
const userCollection = collection(db, "user");
import cron from 'node-cron';
import dotenv from 'dotenv';


// Express server
const app = express();
const port = process.env.PORT || 8001;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


const runAtMidnight = async() => {

  try {

    const data = await getDocs(userCollection)
    let users = await data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    const uniqueArray = Array.from(
      new Map(users.map(item => [item.chatId, item])).values()
  );

    const now = new Date();
    const time = date.format(now, 'MMM DD YYYY');

    // CEXs

    // Bybit
    const res_bybit1 = await axios('http://localhost:8000/bybitdata');
    const res_bybit2 = await axios('http://localhost:8000/bybitdepth');
    const volume_bybit = parseFloat(res_bybit1.data.result.list[0].turnover24h).toFixed(2);
    const spread_bybit = parseFloat(res_bybit1.data.result.list[0].ask1Price-res_bybit1.data.result.list[0].bid1Price).toFixed(3);
    const depth_bybit = res_bybit2.data;

    // Kucoin
    const res_kucoin1 = await axios('http://localhost:8000/kucoindata?token=route');
    const res_kucoin2 = await axios('http://localhost:8000/kucoindepth?token=route');
    const res_kukoin3 = await axios('http://localhost:8000/kucoindata?token=dfyn');
    const res_kukoin4= await axios('http://localhost:8000/kucoindepth?token=dfyn');
    const volume_kucoin = parseFloat(res_kucoin1.data.data.volValue).toFixed(2);
    const spread_kucoin = parseFloat(res_kucoin1.data.data.sell-res_kucoin1.data.data.buy).toFixed(3);
    const depth_kucoin = res_kucoin2.data;

    // Mexc
    const res_mexc1 = await axios('http://localhost:8000/mexcdata?token=route');
    const res_mexc2 = await axios('http://localhost:8000/mexcdepth?token=route');
    const res_mexc3 = await axios('http://localhost:8000/mexcdata?token=dfyn');;
    const res_mexc4 = await axios('http://localhost:8000/mexcdepth?token=dfyn');
    const volume_mexc = parseFloat((res_mexc1.data.volume) * res_mexc1.data.lastPrice).toFixed(2);
    const spread_mexc = parseFloat(res_mexc1.data.askPrice-res_mexc1.data.bidPrice).toFixed(3);
    const depth_mexc = res_mexc2.data;

    // Gate
    const res_gate1 = await axios('http://localhost:8000/gatedata?token=route');
    const res_gate2 = await axios('http://localhost:8000/gatedepth?token=route');
    const res_gate3 = await axios('http://localhost:8000/gatedata?token=dfyn');
    const res_gate4 = await axios('http://localhost:8000/gatedepth?token=dfyn');
    const volume_gate = parseFloat(res_gate1.data[0].quote_volume).toFixed(2);
    const spread_gate = parseFloat(res_gate1.data[0].lowest_ask-res_gate1.data[0].highest_bid).toFixed(3);
    const depth_gate = res_gate2.data;

    // Ascendex
    const res_asd1 = await axios('http://localhost:8000/asddata');
    const res_asd2 = await axios('http://localhost:8000/asddepth');
    const volume_asd = parseFloat((res_asd1.data.data.volume) * res_asd1.data.data.open).toFixed(2);
    const spread_asd = parseFloat(res_asd1.data.data.ask[0]-res_asd1.data.data.bid[0]).toFixed(3);
    const depth_asd = res_asd2.data;

    // HTX
    const res_htx1 = await axios('http://localhost:8000/htxdata');
    const res_htx2 = await axios('http://localhost:8000/htxdepth');
    // const volume_htx = parseFloat(res_htx1.data.tick.vol).toFixed(2);
    // const spread_htx = parseFloat(res_kucoin1.data.data.volValue).toFixed(3);
    // const depth_htx = res_htx2.data;


    // DEXs
    const res_uniswaprouteethv2 = await axios('http://localhost:8000/uniswapdata?token=routeethv2');
    const res_uniswaprouteethv3 = await axios('https://api.geckoterminal.com/api/v2/networks/eth/pools/0xcfac0661d802ef85ece2f02ca691cd2079a19456'); 
    const res_uniswaprouteusdcv2 = await axios('http://localhost:8000/uniswapdata?token=routeusdcv2');
    const res_dfynrouteeth = await axios('http://localhost:8000/dfyndata?token=routeeth');
    const res_dfynrouteusdc = await axios('http://localhost:8000/dfyndata?token=routeusdc');
    const res_uniswaprouteethv2_depth = await axios('http://localhost:8000/uniswapv2eth_data_route_depth');
    const res_uniswaprouteusdcv2_depth = await axios('http://localhost:8000/uniswapv2usdc_data_route_depth');
    const res_uniswaprouteethv3_depth = await axios('http://localhost:8000/uniswapv3eth_data_route_depth');
    const res_dfynrouteeth_depth = await axios('http://localhost:8000/dfyneth_data_route_depth');
    const res_dfynrouteusdc_depth = await axios('http://localhost:8000/dfynusdc_data_route_depth');

    // DFYN Kucoin
    const vol_kucoin_dfyn = parseFloat(res_kukoin3.data.data.volValue).toFixed(2);
    const depth_kucoin_dfyn = res_kukoin4.data;

    // DFYN Mexc
    const vol_mexc = parseFloat(res_mexc3.data.quoteVolume).toFixed(2);
    const depth_mexc_dfyn = res_mexc4.data;

    // DFYN Gate
    const vol_gate_dfyn = parseFloat(res_gate3.data[0].quote_volume).toFixed(2);
    const depth_gate_dfyn = res_gate4.data;


    const webhookUrl = process.env.LD_TEST_WEBHOOK_URL;

      try {
        const response = await axios.post(webhookUrl, {
          text: `
          -----[ROUTE]-----

            1.1 ByBit
              1.1.1 Trading Volume: ${(Number(volume_bybit)).toLocaleString()}
              1.1.2 Spread: ${parseFloat((res_bybit1.data.result.list[0].ask1Price - res_bybit1.data.result.list[0].bid1Price) / res_bybit1.data.result.list[0].bid1Price * 100).toFixed(2)}
              1.1.3 Depth: 0.3%: ${parseFloat(depth_bybit["0.3%"]).toFixed(2)}, 0.5%: ${parseFloat(depth_bybit["0.5%"]).toFixed(2)}, 1%: ${parseFloat(depth_bybit["1%"]).toFixed(2)}
            
            1.2 KuCoin
              1.1.1 Trading Volume: ${(Number(volume_kucoin)).toLocaleString()}
              1.1.2 Spread: ${parseFloat((res_kucoin1.data.data.sell - res_kucoin1.data.data.buy) / res_kucoin1.data.data.buy * 100).toFixed(2)}
              1.1.3 Depth: 0.3%: ${parseFloat(depth_kucoin["0.3%"]).toFixed(2)}, 0.5%: ${parseFloat(depth_kucoin["0.5%"]).toFixed(2)}, 1%: ${parseFloat(depth_kucoin["1%"]).toFixed(2)}
              
            1.3 Mexc
              1.1.1 Trading Volume: ${(Number(volume_mexc)).toLocaleString()}
              1.1.2 Spread: ${parseFloat((res_mexc1.data.askPrice - res_mexc1.data.bidPrice) / res_mexc1.data.bidPrice * 100).toFixed(2)}
              1.1.3 Depth: 0.3%: ${parseFloat(depth_mexc["0.3%"]).toFixed(2)}, 0.5%: ${parseFloat(depth_mexc["0.5%"]).toFixed(2)}, 1%: ${parseFloat(depth_mexc["1%"]).toFixed(2)}
              
            1.4 Gate
              1.1.1 Trading Volume: ${(Number(volume_gate)).toLocaleString()}
              1.1.2 Spread: ${parseFloat((res_gate1.data[0].lowest_ask - res_gate1.data[0].highest_bid) / res_gate1.data[0].highest_bid * 100).toFixed(2)}
              1.1.3 Depth: 0.3%: ${parseFloat(depth_gate["0.3%"]).toFixed(2)}, 0.5%: ${parseFloat(depth_gate["0.5%"]).toFixed(2)}, 1%: ${parseFloat(depth_gate["1%"]).toFixed(2)}
              
            1.5 Ascendex
              1.1.1 Trading Volume: ${(Number(volume_asd)).toLocaleString()}
              1.1.2 Spread: ${parseFloat((res_asd1.data.data.ask[0] - res_asd1.data.data.bid[0]) / res_asd1.data.data.bid[0] * 100).toFixed(2)}
              1.1.3 Depth: 0.3%: ${parseFloat(depth_asd["0.3%"]).toFixed(2)}, 0.5%: ${parseFloat(depth_asd["0.5%"]).toFixed(2)}, 1%: ${parseFloat(depth_asd["1%"]).toFixed(2)}
              
            1.6 Dfyn ROUTE-ETH
              1.1.1 Trading Volume: ${Number(res_dfynrouteeth.data.data.attributes.volume_usd.h24).toLocaleString()}
              1.1.2 Depth: 0.3%:  ${parseFloat(res_dfynrouteeth_depth.data["0.3%"]).toFixed(2)} , 0.5%:  ${parseFloat(res_dfynrouteeth_depth.data["0.5%"]).toFixed(2)} , 1%:  ${parseFloat(res_dfynrouteeth_depth.data["1%"]).toFixed(2)}

            1.7 Dfyn ROUTE-USDC
              1.1.1 Trading Volume: ${Number(res_dfynrouteusdc.data.data.attributes.volume_usd.h24).toLocaleString()}
              1.1.2 Depth: 0.3%:  ${parseFloat(res_dfynrouteusdc_depth.data["0.3%"]).toFixed(2)} , 0.5%:  ${parseFloat(res_dfynrouteusdc_depth.data["0.5%"]).toFixed(2)} , 1%:  ${parseFloat(res_dfynrouteusdc_depth.data["1%"]).toFixed(2)} 
                
            1.8 UniSwap V2 ROUTE-ETH
              1.1.1 Trading Volume: ${Number(res_uniswaprouteethv2.data.data.attributes.volume_usd.h24).toLocaleString()}
              1.1.2 Depth: 0.3%:  ${parseFloat(res_uniswaprouteethv2_depth.data["0.3%"]).toFixed(2)} , 0.5%:  ${parseFloat(res_uniswaprouteethv2_depth.data["0.5%"]).toFixed(2)} , 1%:  ${parseFloat(res_uniswaprouteethv2_depth.data["1%"]).toFixed(2)}
        
            1.9 UniSwap V2 ROUTE-USDC
              1.1.1 Trading Volume: ${Number(res_uniswaprouteusdcv2.data.data.attributes.volume_usd.h24).toLocaleString()}
              1.1.2 Depth: 0.3%: ${parseFloat(res_uniswaprouteusdcv2_depth.data["0.3%"]).toFixed(2)} , 0.5%: ${parseFloat(res_uniswaprouteusdcv2_depth.data["0.5%"]).toFixed(2)} , 1%: ${parseFloat(res_uniswaprouteusdcv2_depth.data["1%"]).toFixed(2)}              
              
            1.10 UniSwap V3 ROUTE-ETH
              1.1.1 Trading Volume: ${(Number(res_uniswaprouteethv3.data.data.attributes.volume_usd.h24)).toLocaleString()}
              1.1.2 Depth: 0.3%: ${parseFloat(res_uniswaprouteethv3_depth.data["0.3%"]).toFixed(2)} , 0.5%: ${parseFloat(res_uniswaprouteethv3_depth.data["0.5%"]).toFixed(2)} , 1%: ${parseFloat(res_uniswaprouteethv3_depth.data["1%"]).toFixed(2)}

          -----[DFYN]-----  

            1.1 KuCoin
              1.1.1 Trading Volume: ${Number(vol_kucoin_dfyn).toLocaleString()}
              1.1.2 Spread: ${parseFloat((res_kukoin3.data.data.sell-res_kukoin3.data.data.buy) / res_kukoin3.data.data.buy * 100).toFixed(2)}
              1.1.3 Depth: 0.3%: ${parseFloat(depth_kucoin_dfyn["0.3%"]).toFixed(2)}, 0.5%: ${parseFloat(depth_kucoin_dfyn["0.5%"]).toFixed(2)}, 1%: ${parseFloat(depth_kucoin_dfyn["1%"]).toFixed(2)}
              
            1.2 Mexc
              1.1.1 Trading Volume: ${Number(vol_mexc).toLocaleString()}
              1.1.2 Spread: ${parseFloat((res_mexc3.data.askPrice-res_mexc3.data.bidPrice) / res_mexc3.data.bidPrice * 100).toFixed(2)}
              1.1.3 Depth: 0.3%: ${parseFloat(depth_mexc_dfyn["0.3%"]).toFixed(2)}, 0.5%: ${parseFloat(depth_mexc_dfyn["0.5%"]).toFixed(2)}, 1%: ${parseFloat(depth_mexc_dfyn["1%"]).toFixed(2)}
              
            1.3 Gate
              1.1.1 Trading Volume: ${Number(vol_gate_dfyn).toLocaleString()}
              1.1.2 Spread: ${parseFloat((res_gate3.data[0].lowest_ask-res_gate3.data[0].highest_bid) / res_gate3.data[0].highest_bid * 100).toFixed(2)}
              1.1.3 Depth: 0.3%: ${parseFloat(depth_gate_dfyn["0.3%"]).toFixed(2)}, 0.5%: ${parseFloat(depth_gate_dfyn["0.5%"]).toFixed(2)}, 1%: ${parseFloat(depth_gate_dfyn["1%"]).toFixed(2)} 
        `, 
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Message sent to Slack successfully:', response.data);
      } catch (error) {
        console.error('Error sending Slack message:', error);
      }
    } catch (error) {
      console.log(error)
    }
};

runAtMidnight();


// cron.schedule('55 23 * * *', runAtMidnight);
// setInterval(runAtMidnight,3000)