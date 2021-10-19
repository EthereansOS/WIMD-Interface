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
                <a className="backtocards" href="javascript:;" onClick={this.props.onBack} >x</a>
                <div className="mainToSwap">
                    <img src="assets/img/treasure.gif"></img>
                    <a href="javascript:;" onClick={redeem} className="RedeemBTN">Redeem</a>
                    <aside>1 Dragon = 12.7 ETH</aside>
                    <aside>You can redeem: 30 ETH</aside>
                    {redeeming && <div>Redeeming</div>}
                    <div className="DragonSupply">
                        <figure>
                            <img src="assets/img/cardImages/199242316350403115624675989599876480538394016058.png"></img>
                            <p></p>
                        </figure>
                    </div>
                </div>
                <div className="SuccesRedeem">
                    <h6>Dear Dragon Hounter, <br></br> you have succesfully redeemed your portion of the treasury!</h6>
                    <a>Transaction</a>
                </div>
            </div>
        );
    }
});