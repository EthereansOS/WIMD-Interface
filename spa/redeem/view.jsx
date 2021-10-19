var Redeem = React.createClass({
    requiredScripts: [
        'spa/index/cardInfo.jsx',
        'spa/inlineLoader.jsx'
    ],
    render() {
        var _this = this;
        return (
            <div className="RedeemDragon">
                <img src="assets/img/treasure.gif"></img>
                <a className="RedeemBTN">Redeem</a>
                <aside>1 Dragon = 12.7 ETH</aside>
                <div className="DragonSupply">
                    <figure>
                        <img></img>
                        <p></p>
                    </figure>
                </div>
            </div>
        );
    }
});