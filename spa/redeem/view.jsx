var Redeem = React.createClass({
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