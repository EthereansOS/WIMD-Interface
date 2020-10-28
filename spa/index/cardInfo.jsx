var CardInfo = React.createClass({
    requiredScripts: [
        'spa/inlineLoader.jsx'
    ],
    render() {
        if(!this.props.card.metadata) {
            return (<InlineLoader/>);
        }
        var blurred = !this.props.clean && (!this.props.card.userData || !this.props.card.userData.balanceOf || this.props.card.userData.balanceOf === '0');
        var showBalance = !blurred && !this.props.hideBalance;
        return (<section className={"singleCollCard" + (blurred ? " blur" : "")}>
            <figure className="collCard">
                <img src={this.props.card.staticImage}/>
            </figure>
            {showBalance && <span className="cardOwnedNumber Brandized">{this.props.card.userData.balanceOf}</span>}
        </section>);
    }
});