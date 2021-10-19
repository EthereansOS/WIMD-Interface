var Redeem = React.createClass({
    requiredScripts: [
        'spa/index/cardInfo.jsx',
        'spa/inlineLoader.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            "ethereum/ping" : this.getBalance
        }
    },
    getBalance() {
        var _this = this;
        _this.setStateVar('balance', 0);
        _this.controller.getBalance().then(balance => _this.setStateVar('balance', balance));
    },
    render() {
        var _this = this;
        var [redeeming, setRedeeming] = useState(false);
        var [amount, setAmount] = useState(1);
        var [balance] = useState(0, "balance");
        var [bravo, setBravo] = useState("");
        function redeem() {
            setBravo(false);
            var bal = parseInt(balance);
            var am = bal;
            if(bal < am) {
                return alert("Insufficient balance");
            }
            if(am <= 0) {
                return alert("Amount must be greater than 0");
            }
            setRedeeming(true);
            _this.controller.redeem(am).then(setBravo).finally(() => setRedeeming(false)).catch(e => alert(e.message || e));
        };
        useEffect(() => _this.getBalance(), []);
        useEffect(() => bravo && _this.getBalance(), [bravo]);
        var bal = parseInt(balance);
        var eths = 12.7 * bal;
        return (
            <div className="RedeemDragon">
                <a className="backtocards" href="javascript:;" onClick={this.props.onBack} >x</a>
                {!bravo && <div className="mainToSwap">
                    <img src="assets/img/treasure.gif"></img>
                    {redeeming && <div>Redeeming</div>}
                    {!redeeming && <a href="javascript:;" onClick={redeem} className="RedeemBTN">Redeem</a>}
                    <aside>1 Dragon = 12.7 ETH</aside>
                    <aside>You can redeem: {eths} ETH</aside>
                    <div className="DragonSupply">
                        <figure>
                            <img src="assets/img/cardImages/199242316350403115624675989599876480538394016058.png"></img>
                            <p>{bal}</p>
                        </figure>
                    </div>
                </div>}
                {bravo && <div className="SuccesRedeem">
                    <h6>Dear Dragon Hunter, <br></br> you have succesfully redeemed your portion of the treasury!</h6>
                    <a target="_blank" href={window.getNetworkElement("etherscanURL") + "tx/" + bravo}>Transaction</a>
                </div>}
            </div>
        );
    }
});