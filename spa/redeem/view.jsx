var Redeem = React.createClass({
    requiredScripts: [
        'spa/index/cardInfo.jsx',
        'spa/inlineLoader.jsx'
    ],
    render() {
        var _this = this;
        var [redeeming, setRedeeming] = useState(false);
        var [amount, setAmount] = useState(1);
        function redeem() {
            setRedeeming(true);
            _this.controller.redeem(amount).finally(() => setRedeeming(false)).catch(e => alert(e.message || e));
        };
        return (
            <div className="RedeemDragon">
                <img src="assets/img/treasure.gif"></img>
                <a className="RedeemBTN">Redeem</a>
                <aside>1 Dragon = 12.7 ETH | Redeemed: 3/6 Dragons</aside>
                <aside>You can redeem: 30 ETH</aside>
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