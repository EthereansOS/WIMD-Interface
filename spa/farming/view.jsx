var Farming = React.createClass({
    requiredScripts: [
        'spa/index/cardInfo.jsx'
    ],
    render() {
        return (<section>
            {this.props.sortedItems.map(it => <section key={it.key} className="collection">
                <CardInfo card={it} />
                <a className="unibtn" href={window.context.uniswapSpawUrlTemplate.format(it.erc20Wrapper)} target="_blank">&#129412;swap</a>
            </section>)}
        </section>);
    }
});