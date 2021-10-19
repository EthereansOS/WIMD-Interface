var Farming = React.createClass({
    requiredScripts: [
        'spa/index/cardInfo.jsx',
        'spa/inlineLoader.jsx'
    ],
    componentDidMount() {
        this.controller.loadData();
    },
    getFirstEndBlock(item) {
        var values = Object.values(item);
        for (var value of values) {
            if (value.stakingData && value.stakingData.stakingData && value.stakingData.stakingData.length > 0) {
                return value.stakingData.stakingData[0].endBlock;
            }
        }
    },
    render() {
        var _this = this;
        return (<section>
            <section className="FarmingTop">
                <h2 className="BrandizedS">Cards</h2>
                {this.props.sortedItems.map((it, i) => <section key={it.key} className="collection CardsBigview">
                    <CardInfo card={it} clean hideBalance />
                    <div className="CardsBigviewInfo">
                        {this.state && this.state.items && this.state.items[i] && <p className="UniPriceBro">$ {window.formatMoney(this.state.items[i].priceInDollars, 1)}</p>}
                        <a className="unibtn" href={window.context.uniSwapInfoURL.format(it.erc20Wrapper)} target="_blank">Liquidity</a>
                        <a className="unibtn" href={window.context.uniswapSpawUrlTemplate.format(it.erc20Wrapper)} target="_blank">Swap</a>
                        <a className="unibtn Opns" href={window.context.openSeaItemLinkTemplate.format(window.whereIsMyDragonEthItem.options.address, it.key)} target="_blank">OpenSea</a>
                        <a className="unibtn" href={window.context.ethItemLinkTemplate.format(it.erc20Wrapper)} target="_blank">Info</a>
                    </div>
                </section>)}
                <section className="Delimitator"></section>
                <h2 className="BrandizedS">Decks</h2>
                <section className="collection DeckBigview">
                    <section className="singleCollCard cardInfo">
                        <figure className="collCard">
                            <img src="//ipfs.io/ipfs/QmbUYRhM8TKGm7iD9mLgSVC5fcToeXaDdk8ntz6yDMJnp1"/>
                        </figure>
                    </section>
                    <div className="CardsBigviewInfoP">
                        <p>A collection of the four common cards of the ITEMS based card game "Where Is My Dragon". Each unit of this deck contains 1 Penguin Fancy Shoes, 1 Unicorn Cat, 1 Magician Unicorn and 1 Magician Cat</p>
                    </div>
                    <div className="CardsBigviewInfo">
                        <a className="unibtn" href="https://v2.info.uniswap.org/token/0xD15c7Fcda27a93b9d4cD3617E09416Ec3aaA5237" target="_blank">Liquidity</a>
                        <a className="unibtn" href="https://swap.item.eth.link/#/swap?outputCurrency=0xD15c7Fcda27a93b9d4cD3617E09416Ec3aaA5237" target="_blank">Swap</a>
                        <a className="unibtn Opns" href="https://opensea.io/assets/0x5a6EdeeE783A17AFa9e40f6a03B6C93Fabc5AdC1/1195241872894617222008635817406839094575782056503" target="_blank">OpenSea</a>
                        <a className="unibtn" href="https://item.eth.link/?interoperable=0xD15c7Fcda27a93b9d4cD3617E09416Ec3aaA5237" target="_blank">Info</a>
                    </div>
                </section>
                <section className="Delimitator"></section>
                <h2 className="BrandizedS">Farming</h2>
                <section className="FarmSection">
                <h1>WIMD Last farming season coming soon...</h1>
                    {/* 
                    <section className="FarmSectionSingle">
                        <figure>
                            <img src="assets/img/cardImages/708710380818572902317750208759935671347114619642.png"></img>
                        </figure>
                        <section className="FarmInfoSec">
                                <h6>Farm Magician Cat</h6>
                                <section className="FarmPoolInfo">
                                    <p>Rewarded Uniswap Pools:</p>
                                    <section className="FarmPools">
                                        <figure>
                                            <img src="assets/img/cardImages/708710380818572902317750208759935671347114619642.png"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>                                   
                                        <figure>
                                            <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x34612903Db071e888a4dADcaA416d3EE263a87b9/logo.png"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>
                                        <figure>
                                            <img src="https://ipfs.io/ipfs/QmXjPmCChUCNeMSoRpSb3wKUARxbucZSQ3W5sZwMf749RX"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>
                                        <figure>
                                            <img src="https://ipfs.io/ipfs/QmXjPmCChUCNeMSoRpSb3wKUARxbucZSQ3W5sZwMf749RX"></img>
                                            <img className="SecImg" src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"></img>
                                        </figure>
                                        <figure>
                                            <img src="https://ipfs.io/ipfs/QmbUYRhM8TKGm7iD9mLgSVC5fcToeXaDdk8ntz6yDMJnp1"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>
                                    </section>
                                </section>
                            <aside>
                                <p className="farmrewardn">Daily Reward: 33 <a className="Brandized" target="_blank" href="https://item.eth.link/?interoperable=0x7C23Ac2E8DA915d4f422CF710f4767FAa0c332fa">Magician Cat</a></p>
                                <a className="FarmButton" href="https://covenants.eth.link/#/farm/dapp/0xb84d838584B7A7F924ed422e7d256c80E03D92cf" target="_blank">Farm</a>
                            </aside>
                        </section>
                    </section>
                    <section className="FarmSectionSingle">
                        <figure>
                            <img src="assets/img/cardImages/1314350493399825849440291684746997404115301872024.png"></img>
                        </figure>
                        <section className="FarmInfoSec">
                                <h6>Farm Penguin Fancy Shoes</h6>
                                <section className="FarmPoolInfo">
                                    <p>Rewarded Uniswap Pools:</p>
                                    <section className="FarmPools">
                                        <figure>
                                            <img src="assets/img/cardImages/1314350493399825849440291684746997404115301872024.png"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>                                   
                                        <figure>
                                            <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x9E78b8274e1D6a76a0dBbf90418894DF27cBCEb5/logo.png"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>
                                        <figure>
                                            <img src="assets/img/cardImages/885404311393007699790400512240499286361791930054.png"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>
                                        <figure>
                                            <img src="https://ipfs.io/ipfs/QmXjPmCChUCNeMSoRpSb3wKUARxbucZSQ3W5sZwMf749RX"></img>
                                            <img className="SecImg" src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"></img>
                                        </figure>
                                        <figure>
                                            <img src="https://ipfs.io/ipfs/QmbUYRhM8TKGm7iD9mLgSVC5fcToeXaDdk8ntz6yDMJnp1"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>
                                    </section>
                                </section>
                            <aside>
                                <p className="farmrewardn">Daily Reward: 33 <a className="Brandized" target="_blank" href="https://item.eth.link/?interoperable=0xE63983b5FAdE429eC052d1b365826C4Bc5fCB198">Penguin Fancy Shoes</a></p>
                                <a className="FarmButton" href="https://covenants.eth.link/#/farm/dapp/0xfF4E8691467AF6d4D5e40F6390B05f0973B83a2e" target="_blank">Farm</a>
                            </aside>
                        </section>
                        
                    </section>
                    <section className="FarmSectionSingle">
                        <figure>
                            <img src="assets/img/cardImages/953680776037830019376762634780957885111415987285.png"></img>
                        </figure>
                        <section className="FarmInfoSec">
                                <h6>Magician Unicorn</h6>
                                <section className="FarmPoolInfo">
                                    <p>Rewarded Uniswap Pools:</p>
                                    <section className="FarmPools">
                                        <figure>
                                            <img src="assets/img/cardImages/953680776037830019376762634780957885111415987285.png"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>                                   
                                        <figure>
                                            <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7b123f53421b1bF8533339BFBdc7C98aA94163db/logo.png"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>
                                        <figure>
                                            <img src="assets/img/cardImages/780555624824904431919937819844714503576378827799.png"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>
                                        <figure>
                                            <img src="https://ipfs.io/ipfs/QmXjPmCChUCNeMSoRpSb3wKUARxbucZSQ3W5sZwMf749RX"></img>
                                            <img className="SecImg" src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"></img>
                                        </figure>
                                        <figure>
                                            <img src="https://ipfs.io/ipfs/QmbUYRhM8TKGm7iD9mLgSVC5fcToeXaDdk8ntz6yDMJnp1"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>
                                    </section>
                                </section>
                            <aside>
                                <p className="farmrewardn">Daily Reward: 33 <a className="Brandized" target="_blank" href="https://item.eth.link/?interoperable=0xA70C8667cCFB63D6b98C2A050c94b7Bf2085dC55">Magician Unicorn</a></p>
                                <a className="FarmButton" href="https://covenants.eth.link/#/farm/dapp/0xC34ed7B21D2Ab2a7b4521f301953977db560B6EE" target="_blank">Farm</a>
                            </aside>
                        </section>
                        
                    </section>
                    <section className="FarmSectionSingle">
                        <figure>
                            <img src="assets/img/cardImages/1111946385153737223689257886665575715568350448705.png"></img>
                        </figure>
                        <section className="FarmInfoSec">
                                <h6>Unicorn Cat</h6>
                                <section className="FarmPoolInfo">
                                    <p>Rewarded Uniswap Pools:</p>
                                    <section className="FarmPools">
                                        <figure>
                                            <img src="assets/img/cardImages/1111946385153737223689257886665575715568350448705.png"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>
                                        <figure>
                                            <img src="assets/img/cardImages/199242316350403115624675989599876480538394016058.png"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>                                   
                                        <figure>
                                            <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x7b123f53421b1bF8533339BFBdc7C98aA94163db/logo.png"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>
                                        <figure>
                                            <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x9E78b8274e1D6a76a0dBbf90418894DF27cBCEb5/logo.png"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>
                                        <figure>
                                            <img src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x34612903Db071e888a4dADcaA416d3EE263a87b9/logo.png"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>
                                        <figure>
                                            <img src="https://ipfs.io/ipfs/QmbUYRhM8TKGm7iD9mLgSVC5fcToeXaDdk8ntz6yDMJnp1"></img>
                                            <img className="SecImg" src="assets/img/ethr.png"></img>
                                        </figure>
                                    </section>
                                </section>
                            <aside>
                                <p className="farmrewardn">Daily Reward: 33 <a className="Brandized" target="_blank" href="https://item.eth.link/?interoperable=0xc2c5667f69E881C83Fc4692f7A08a22370B4cc41">Unicorn Cat</a></p>
                                <a className="FarmButton" href="https://covenants.eth.link/#/farm/dapp/0x00898f652934EfF850886289a94D41CF9457e7Af" target="_blank">Farm</a>
                            </aside>
                        </section>
                        
                        
                    </section>
                    */}
                </section>
                
            </section>
        </section>);
    }
});