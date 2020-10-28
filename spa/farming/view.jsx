var Farming = React.createClass({
    requiredScripts: [
        'spa/index/cardInfo.jsx'
    ],
    componentDidMount() {
        this.controller.loadData();
    },
    render() {
        return (<section>
            {this.props.sortedItems.map((it, i)=> <section key={it.key} className="collection">
                <CardInfo card={it} />
                {this.state && this.state.items && this.state.items[i] && <span>Price: $ {window.formatMoney(this.state.items[i].priceInDollars, 1)}</span>}
                <a className="unibtn" href={window.context.uniswapSpawUrlTemplate.format(it.erc20Wrapper)} target="_blank">&#129412;swap</a>
            </section>)}
        </section>);
    }
});