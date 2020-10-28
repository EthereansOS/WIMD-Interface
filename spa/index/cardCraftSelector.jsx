var CardCraftSelector = React.createClass({
    requiredScripts: [
        "spa/index/cardInfo.jsx"
    ],
    openSelection(e) {
        window.preventItem(e);
        this.oldValue = this.input.value;
        this.setState({selecting: true});
    },
    selectCard(e, selected) {
        window.preventItem(e);
        if(!selected && e.relatedTarget && $(e.relatedTarget).findReactComponent() === this) {
            var index = parseInt(e.relatedTarget.dataset.index);
            selected = this.props.items.filter(it => it.index === index)[0];
        }
        if(selected && (!selected.userData || !selected.userData.balanceOf || selected.userData.balanceOf === '0')) {
            //return;
        }
        var state = {
            selecting : false
        }
        var oldSelected = this.state && this.state.selected;
        selected && (state.selected = selected);
        var _this = this;
        this.setState(state, () => {
            _this.input.value = (!this.oldValue || isNaN(parseInt(this.oldValue)) ? "4" : this.oldValue);
            delete _this.oldValue;
            oldSelected !== selected && _this.callOnUpdate();
        });
    },
    onKeyUp(e) {
        window.preventItem(e);
        this.onKeyUpTiemoutId && window.clearTimeout(this.onKeyUpTiemoutId);
        this.onKeyUpTiemoutId = window.setTimeout(this.callOnUpdate, window.context.keyUpTimeoutInterval);
    },
    callOnUpdate() {
        this.highlight();
        var amount = parseInt(this.input && this.input.value);
        amount = isNaN(amount) ? 0 : amount;
        var card = this.state && this.state.selected;
        var _this = this;
        card && setTimeout(() => _this.props.onUpdate(this, {
            card,
            amount
        }));
    },
    highlight() {
        if(!this.state || !this.state.selected) {
            return $(this.input).removeClass("highlight");
        }
        var amount = parseInt(this.input && this.input.value);
        amount = isNaN(amount) ? 0 : amount;
        var highlight = window.context.highlightValues.indexOf(amount) !== -1;
        highlight && $(this.input).addClass("highlight");
        !highlight && $(this.input).removeClass("highlight");
    },
    renderSelection() {
        var _this = this;
        var items = this.props.items;
        var exceptions = this.props.exceptFor || [];
        var selected = this.state && this.state.selected;
        exceptions = exceptions.filter(it => it !== undefined && it !== null && it.card !== selected).map(it => it.card);
        items = items.filter(it => exceptions.indexOf(it) === -1);
        return(<section className="cardSelector" tabIndex="-1" ref={ref => ref && ref.focus()} onBlur={_this.selectCard}>
            <ul>
                {items.map(it => <li key={it.key}>
                    {_this.renderCardToClick(it, e => _this.selectCard(e, it),"cardOnSelectionView")}
                </li>)}
            </ul>
        </section>);
    },
    onClick(e, onClick) {
        if(this.props.readOnly) {
            return;
        }
        onClick(e);
    },
    renderCardToClick(card, onClick, className) {
        return(<a href="javascript:;" className={className + (this.props.readOnly ? " disabled" : "")} data-index={card.index} onClick={e => this.onClick(e, onClick)}>
            <CardInfo card={card} hideBalance/>
        </a>);
    },
    render() {
        if(this.state && this.state.selecting) {
            return this.renderSelection();
        }
        return (
            <section className="craftSingle">
                {this.state && this.state.selected && this.renderCardToClick(this.state.selected, this.openSelection, "cardSelectedView")}
                {(!this.state || !this.state.selected) && <a href="javascript:;" className={"SELECTUM" + (this.props.readOnly ? " disabled" : "")} onClick={this.openSelection}>SELECT</a>}
                <input ref={ref => this.input = ref} type="number" className="cardQuantity" onKeyUp={this.onKeyUp} onChange={this.onKeyUp} readOnly={this.props.readOnly || !this.state || !this.state.selected}/>
            </section>
        );
    }
});