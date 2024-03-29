window.voidEthereumAddress = '0x0000000000000000000000000000000000000000';
window.voidEthereumAddressExtended = '0x0000000000000000000000000000000000000000000000000000000000000000';
window.descriptionWordLimit = 300;
window.oldUrlRegex = new RegExp("(https?:\\/\\/[^\s]+)", "gs");
window.urlRegex = new RegExp("(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$", "gs");
window.solidityImportRule = new RegExp("import( )+\"(\\d+)\"( )*;", "gs");
window.pragmaSolidityRule = new RegExp("pragma( )+solidity( )*(\\^|>)\\d+.\\d+.\\d+;", "gs");
window.base64Regex = new RegExp("data:([\\S]+)\\/([\\S]+);base64", "gs");

window.Main = async function Main() {
    window.getPage();
    await window.loadContext();
    window.ethereum && await window.onEthereumUpdate(0);
    window.loadAddressBarParam();
    window.checkTreasureBalance();
};

window.connectFromHomepage = async function connectFromHomepage(button) {
    if(!window.ethereum) {
        return window.location.href = "https://metamask.io";
    }
    button && (button.innerHTML = '<spa class="loaderMinimino"></span>');
    button && (button.className = '');
    await window.loadContext();
    window.choosePage();
};

window.checkTreasureBalance = async function checkTreasureBalance() {
    window.balanceOf = window.web3.utils.fromWei(await window.web3.eth.getBalance(window.getNetworkElement("treasureAddress")), "ether");
    $(".balance").html(window.formatMoney(window.balanceOf, 1) + " ETH");
    $('.loaderLOL').addClass('mini');
};

window.loadAddressBarParam = async function loadAddressBarParam() {
    if(window.addressBarParams.toggle) {
        if(!window.ethereum) {
            return window.location.href = "https://metamask.io";
        }
        window.choosePage();
    }
};

window.newContract = function newContract(abi, address) {
    window.contracts = window.contracts || {};
    var key = window.web3.utils.sha3(JSON.stringify(abi));
    var contracts = (window.contracts[key] = window.contracts[key] || {});
    address = address || window.voidEthereumAddress;
    key = address.toLowerCase();
    contracts[key] = contracts[key] || new window.web3.eth.Contract(abi, address === window.voidEthereumAddress ? undefined : address);
    return contracts[key];
};

window.loadDFO = async function loadDFO(address, allAddresses) {
    allAddresses = allAddresses || [];
    allAddresses.push(address);
    var dfo = window.newContract(window.context.proxyAbi, address);
    var votingToken = window.voidEthereumAddress;

    try {
        var delegates = await window.web3.eth.call({
            to: element.dFO.options.address,
            data: element.dFO.methods.getDelegates().encodeABI()
        });
        try {
            delegates = window.web3.eth.abi.decodeParameter("address[]", delegates);
        } catch (e) {
            delegates = window.web3.eth.abi.decodeParameters(["address", "address", "address", "address", "address", "address"], delegates);
        }
        votingToken = delegates[0];
    } catch (e) {
        votingToken = undefined;
    }

    if (!votingToken || votingToken === window.voidEthereumAddress) {
        try {
            votingToken = await window.blockchainCall(dfo.methods.getToken);
        } catch (e) {}
    }

    try {
        await window.blockchainCall(window.newContract(window.context.IERC20ABI, votingToken).methods.name);
    } catch (e) {
        votingToken = undefined;
    }

    if (!votingToken || votingToken === window.voidEthereumAddress) {
        var logs = await window.getLogs({
            address,
            topics: [
                window.proxyChangedTopic = window.proxyChangedTopic || window.web3.utils.sha3('ProxyChanged(address)')
            ],
            fromBlock: window.getNetworkElement("deploySearchStart"),
            toBlock: 'latest'
        }, true);
        return await window.loadDFO(window.web3.eth.abi.decodeParameter('address', logs[0].topics[1]), allAddresses);
    }
    dfo.options.originalAddress = allAddresses[0];
    dfo.options.allAddresses = allAddresses;
    try {
        dfo.metadataLink = window.web3.eth.abi.decodeParameter('string', await window.blockchainCall(dfo.methods.read, 'getMetadataLink', '0x'));
    } catch(e) {
    }
    return dfo;
};

window.getLogs = async function(a, endOnFirstResult) {
    var args = JSON.parse(JSON.stringify(a));
    var logs = [];
    args.fromBlock = args.fromBlock || (window.getNetworkElement('deploySearchStart') + '');
    args.toBlock = args.toBlock || (await window.web3.eth.getBlockNumber() + '');
    args.fromBlock = args.fromBlock !== "undefined" ? args.fromBlock : "0";
    var to = parseInt(args.toBlock);
    var fillWithWeb3Logs = async function(logs, args) {
        if(window.web3.currentProvider === window.web3ForLogs.currentProvider) {
            return logs;
        }
        var newArgs = {};
        Object.entries(args).forEach(entry => newArgs[entry[0]] = entry[1]);
        newArgs.fromBlock = window.web3.startBlock;
        newArgs.toBlock = 'latest';
        logs.push(...(await window.web3.eth.getPastLogs(newArgs)));
        return logs;
    };
    while (isNaN(to) || parseInt(args.fromBlock) <= to) {
        var newTo = parseInt(args.fromBlock) + window.context.blockSearchSection;
        newTo = newTo <= to ? newTo : to;
        args.toBlock = isNaN(newTo) ? args.toBlock : (newTo + '');
        logs.push(...(await window.web3ForLogs.eth.getPastLogs(args)));
        if (isNaN(to) || logs.length > 0 && endOnFirstResult === true) {
            return await fillWithWeb3Logs(logs, args);
        }
        args.fromBlock = (parseInt(args.toBlock) + 1) + '';
    }
    return await fillWithWeb3Logs(logs, args);
};

window.onEthereumUpdate = function onEthereumUpdate(millis) {
    return new Promise(function(ok) {
        setTimeout(async function() {
            var update = false;
            if (!window.networkId || window.networkId !== parseInt(window.ethereum.chainId)) {
                delete window.contracts;
                window.ethereum && (window.ethereum.enable = () => window.ethereum.request({ method: 'eth_requestAccounts' }));
                window.ethereum && window.ethereum.autoRefreshOnNetworkChange && (window.ethereum.autoRefreshOnNetworkChange = false);
                window.ethereum && window.ethereum.on && (!window.ethereum._events || !window.ethereum._events.accountsChanged || window.ethereum._events.accountsChanged.length === 0) && window.ethereum.on('accountsChanged', window.onEthereumUpdate);
                window.ethereum && window.ethereum.on && (!window.ethereum._events || !window.ethereum._events.chainChanged || window.ethereum._events.chainChanged.length === 0) && window.ethereum.on('chainChanged', window.onEthereumUpdate);
                window.web3 = await createWeb3(window.context.blockchainConnectionString || window.ethereum);
                window.networkId = await window.web3.eth.net.getId();
                window.web3ForLogs = await createWeb3(window.getNetworkElement("blockchainConnectionForLogString") || window.web3.currentProvider);
                var network = window.context.ethereumNetwork[window.networkId];
                if (network === undefined || network === null) {
                    return alert('This network is actually not supported!');
                }
                update = true;
                delete window.loadedTokens;
                window.loadOffChainWallets();
                window.uniswapV2Router = window.newContract(window.context.uniswapV2RouterABI, window.context.uniswapV2RouterAddress);
                window.wethAddress = window.web3.utils.toChecksumAddress(await window.blockchainCall(window.uniswapV2Router.methods.WETH));
            }
            delete window.walletAddress;
            try {
                window.walletAddress = (await window.web3.eth.getAccounts())[0];
            } catch (e) {}
            update && $.publish('ethereum/update');
            $.publish('ethereum/ping');
            return ok(window.web3);
        }, !isNaN(millis) ? millis : 550);
    });
};

window.createWeb3 = async function createWeb3(connectionProvider) {
    var web3 = new window.Web3Browser(connectionProvider);
    web3.currentProvider.setMaxListeners && window.web3.currentProvider.setMaxListeners(0);
    web3.eth.transactionBlockTimeout = 999999999;
    web3.eth.transactionPollingTimeout = new Date().getTime();
    web3.startBlock = await web3.eth.getBlockNumber();
    return web3;
};

window.getNetworkElement = function getNetworkElement(element) {
    var network = window.context.ethereumNetwork[window.networkId];
    if (network === undefined || network === null) {
        return;
    }
    return window.context[element + network];
};

window.isEthereumAddress = function isEthereumAddress(ad) {
    if (ad === undefined || ad === null) {
        return false;
    }
    var address = ad.split(' ').join('');
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
        return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
        return true;
    } else {
        address = address.replace('0x', '');
        var addressHash = window.web3.utils.sha3(address.toLowerCase());
        for (var i = 0; i < 40; i++) {
            if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
                //return false;
            }
        }
    }
    return true;
};

window.hasEthereumAddress = function(address) {
    return window.isEthereumAddress(address) && address !== window.voidEthereumAddress;
}

window.loadContext = async function loadContext() {
    var context = await window.AJAXRequest('data/context.json');
    var localContext = {};
    try {
        localContext = await window.AJAXRequest('data/context.local.json');
    } catch(e) {
        console.clear && console.clear();
    }
    window.context = window.deepCopy(context, localContext);
};

window.deepCopy = function deepCopy(data, extension) {
    data = data ? JSON.parse(JSON.stringify(data)) : {};
    extension = extension ? JSON.parse(JSON.stringify(extension)) : {};
    var keys = Object.keys(extension);
    for(var i in keys) {
        var key = keys[i];
        if(!data[key]) {
            data[key] = extension[key];
            continue;
        }
        try {
            if(Object.keys(data[key]).length > 0 && Object.keys(extension[key]).length > 0) {
                data[key] = deepCopy(data[key], extension[key]);
                continue;
            }
        } catch(e) {
        }
        data[key] = extension[key];
    }
    return data;
};

window.choosePage = async function choosePage() {
    if (await window.loadCustomizedPage()) {
        return;
    }
    var page;
    try {
        page = window.location.pathname.split('/').join('');
        page = page.indexOf('.html') === -1 ? undefined : page.split('.html').join('');
    } catch (e) {}
    page = (page || 'index') + 'Main';

    try {
        var maybePromise = window[page] && window[page]();
        maybePromise && maybePromise.catch && await maybePromise;
    } catch (e) {
        console.error(e);
    }
};

window.getLink = function getLink() {
    var link = window.location.protocol + '//';
    link += window.location.hostname;
    window.location.port && (link += ':' + window.location.port);
    return link;
};

window.loadCustomizedPage = async function loadCustomizedPage() {
    return false;
};

window.getData = function getData(root, checkValidation) {
    if (!root) {
        return;
    }
    var data = {};
    var children = root.children().find('input,select,textarea');
    children.length === 0 && (children = root.children('input,select,textarea'));
    children.each(function(i, input) {
        var id = ((input.id || i) + '').split('.');
        var value;
        input.type && input.type !== 'checkbox' && (value = input.value);
        input.type === 'number' && (value = parseFloat(value.split(',').join('')));
        input.type === 'number' && isNaN(value) && (value = parseFloat((input.dataset.defaultValue || '').split(',').join('')));
        (input.type === 'checkbox' || input.type === 'radio') && (value = input.checked);
        !input.type || input.type === 'hidden' && (value = $(input).val());
        input.type === 'file' && (value = input.files);
        if (checkValidation) {
            if (!value) {
                throw "Data is mandatory";
            }
            if (input.type === 'number' && isNaN(value)) {
                throw "Number is mandatory";
            }
        }
        var x = data;
        while (id.length > 0) {
            var partialId = id.pop();
            x = data[partialId] = data[partialId] || id.length === 0 ? value : {};
        }
    });

    return data;
};

window.setData = function setData(root, data) {
    if (!root || !data) {
        return;
    }
    var children = root.children().find('input,select,textarea');
    children.length === 0 && (children = root.children('input,select,textarea'));
    children.each(function(i, input) {
        var id = input.id || i;
        !input.type || input.type !== 'checkbox' && input.type !== 'radio' && input.type !== 'file' && $(input).val(data[id]);
        input.type && (input.type === 'checkbox' || input.type === 'radio') && (input.checked = data[id] === true);
        input.type === 'file' && (input.files = data[id]);
    });
};

window.getAddress = async function getAddress() {
    await window.ethereum.enable();
    return (window.walletAddress = (await window.web3.eth.getAccounts())[0]);
};

window.getSendingOptions = function getSendingOptions(transaction, value) {
    return new Promise(async function(ok, ko) {
        if (transaction) {
            var from = await window.getAddress();
            var nonce = await window.web3.eth.getTransactionCount(from);
            return window.bypassEstimation ? ok({
                nonce,
                from,
                gas: window.gasLimit || '7900000',
                value
            }) : transaction.estimateGas({
                    nonce,
                    from,
                    value,
                    gas: '7900000',
                    gasLimit: '7900000'
                },
                function(error, gas) {
                    if (error) {
                        return ko(error.message || error);
                    }
                    return ok({
                        nonce,
                        from,
                        gas: gas || window.gasLimit || '7900000',
                        value
                    });
                });
        }
        return ok({
            from: window.walletAddress || null,
            gas: window.gasLimit || '99999999'
        });
    });
};

window.createContract = async function createContract(abi, data) {
    var args = [];
    if (arguments.length > 2) {
        for (var i = 2; i < arguments.length; i++) {
            args.push(arguments[i]);
        }
    }
    var from = await window.getAddress();
    data = window.newContract(abi).deploy({
        data,
        arguments: args,
    });
    var nonce = await window.web3.eth.getTransactionCount(from);
    nonce = parseInt(window.numberToString(nonce) + '');
    var contractAddress = window.getNextContractAddress && window.getNextContractAddress(from, nonce === 0 ? undefined : nonce);
    try {
        contractAddress = (await window.sendBlockchainTransaction(undefined, window.web3.eth.sendTransaction({
            from,
            data: data.encodeABI(),
            gasLimit: await data.estimateGas({ from })
        }))).contractAddress;
    } catch (e) {
        try {
            if (!contractAddress || (e.message || e).indexOf("The contract code couldn't be stored, please check your gas") === -1) {
                throw e;
            }
        } catch (a) {
            throw e;
        }
    }
    return window.newContract(abi, contractAddress);
};

window.blockchainCall = async function blockchainCall(value, oldCall) {
    var args = [];
    var call = value !== undefined && isNaN(value) ? value : oldCall;
    for (var i = value === call ? 1 : 2; i < arguments.length; i++) {
        args.push(arguments[i]);
    }
    value = isNaN(value) ? undefined : value;
    var method = (call.implementation ? call.get : call.new ? call.new : call).apply(call, args);
    return await (method._method.stateMutability === 'view' || method._method.stateMutability === 'pure' ? method.call(await window.getSendingOptions()) : window.sendBlockchainTransaction(value, method));
};

window.sendBlockchainTransaction = function sendBlockchainTransaction(value, transaction) {
    return new Promise(async function(ok, ko) {
        var handleTransactionError = function handleTransactionError(e) {
            e !== undefined && e !== null && (e.message || e).indexOf('not mined within') === -1 && ko(e);
        }
        try {
            (transaction = transaction.send ? transaction.send(await window.getSendingOptions(transaction, value), handleTransactionError) : transaction).on('transactionHash', transactionHash => {
                $.publish('transaction/start');
                var stop = function() {
                    $.unsubscribe('transaction/stop', stop);
                    handleTransactionError('stopped');
                };
                $.subscribe('transaction/stop', stop);
                var timeout = async function() {
                    var receipt = await window.web3.eth.getTransactionReceipt(transactionHash);
                    if (!receipt || !receipt.blockNumber || parseInt(await window.web3.eth.getBlockNumber()) < (parseInt(receipt.blockNumber) + (window.context.transactionConfirmations || 0))) {
                        return window.setTimeout(timeout, window.context.transactionConfirmationsTimeoutMillis);
                    }
                    $.unsubscribe('transaction/stop', stop);
                    return transaction.then(ok);
                };
                window.setTimeout(timeout);
            }).catch(handleTransactionError);
        } catch (e) {
            return handleTransactionError(e);
        }
    });
};

window.loadFunctionalityNames = async function loadFunctionalityNames(element) {
    var functionalityNames = await window.blockchainCall(element.functionalitiesManager.methods.functionalityNames);
    functionalityNames = JSON.parse((functionalityNames.endsWith(',]') ? (functionalityNames.substring(0, functionalityNames.lastIndexOf(',]')) + ']') : functionalityNames).trim());
    return functionalityNames;
};

window.loadFunctionalities = function loadFunctionalities(element, callback, ifNecessary) {
    if (!element) {
        return new Promise(ok => ok());
    }
    if (ifNecessary && element.functionalities && Object.keys(element.functionalities).length && element.functionalitiesAmount) {
        return new Promise(ok => ok(element.functionalities));
    }
    if (element.waiters) {
        return new Promise(function(ok) {
            if (!element.waiters || element.waiters.length === 0) {
                delete element.waiters;
                return ok(element.functionalities);
            }
            element.waiters.push([ok, callback]);
        });
    }
    element.waiters = [];
    return new Promise(async function(ok) {
        try {
            element.functionalityNames = await window.loadFunctionalityNames(element);
            callback && callback();
        } catch (e) {
            element.functionalityNames = [];
        }
        var functionalitiesJSON = await blockchainCall(element.functionalitiesManager.methods.functionalitiesToJSON);
        var functionalities = window.parseFunctionalities(functionalitiesJSON);
        var keys = Object.keys(functionalities);
        element.functionalities && Object.keys(element.functionalities).map(key => {
            if (!functionalities[key]) {
                delete element.functionalities[key];
            }
        });
        element.functionalities && callback && callback();
        element.functionalities = element.functionalities || {};
        for (var i in keys) {
            var key = keys[i];
            element.functionalityNames.push(key);
            callback && callback();
            var functionality = functionalities[key];
            if (element && functionality.codeName === 'getMinimumBlockNumberForSurvey') {
                element.getMinimumBlockNumberForSurvey = functionality;
            }
            if (element && functionality.codeName === 'checkSurveyResult') {
                element.checkSurveyResult = functionality;
            }
            functionality.inputParameters = [];
            try {
                functionality.inputParameters = functionality.methodSignature.split(functionality.methodSignature.substring(0, functionality.methodSignature.indexOf('(') + 1)).join('').split(')').join('');
                functionality.inputParameters = functionality.inputParameters ? functionality.inputParameters.split(',') : [];
            } catch (e) {}
            callback && callback();
            try {
                functionality.code = functionality.code || await window.loadContent(functionality.sourceLocationId, functionality.sourceLocation);
                if (functionality.codeName !== 'getEmergencySurveyStaking' && functionality.sourceLocationId === 0) {
                    delete functionality.code;
                }
            } catch (e) {}
            functionality.description = window.extractHTMLDescription(functionality.code);
            functionality.compareErrors = await window.searchForCodeErrors(functionality.location, functionality.code, functionality.codeName, functionality.methodSignature, functionality.replaces);
            element.functionalities && (element.functionalities[key] = functionality);
            callback && callback();
            for (var i in element.waiters) {
                var c = element.waiters[i][1];
                c && setTimeout(c);
            }
            if (!element.functionalities) {
                break;
            }
        }
        if (element.waiters) {
            for (var i in element.waiters) {
                var end = element.waiters[i][0];
                setTimeout(() => end(element.functionalities));
            }
            delete element.waiters;
        }
        return ok(element.functionalities);
    });
};

window.parseFunctionalities = function parseFunctionalities(functionalitiesJSON) {
    try {
        var functionalities = {};
        JSON.parse((functionalitiesJSON.endsWith(',]') ? (functionalitiesJSON.substring(0, functionalitiesJSON.lastIndexOf(',]')) + ']') : functionalitiesJSON).trim()).forEach(it => functionalities[it.codeName] = it);
        return functionalities;
    } catch (e) {
        console.error(e);
        console.log(functionalitiesJSON);
    }
    return null;
};

window.indexMain = function indexMain() {
    window.Boot();
};

window.fromDecimals = function fromDecimals(n, d, noFormat) {
    n = (n && n.value || n);
    d = (d && d.value || d);
    if (!n || !d) {
        return "0";
    }
    var decimals = (typeof d).toLowerCase() === 'string' ? parseInt(d) : d;
    var symbol = window.toEthereumSymbol(decimals);
    if (symbol) {
        var result = window.web3.utils.fromWei((typeof n).toLowerCase() === 'string' ? n : window.numberToString(n), symbol);
        return noFormat === true ? result : window.formatMoney(result);
    }
    var number = (typeof n).toLowerCase() === 'string' ? parseInt(n) : n;
    if (!number || this.isNaN(number)) {
        return '0';
    }
    var nts = parseFloat(window.numberToString((number / (decimals < 2 ? 1 : Math.pow(10, decimals)))));
    nts = window.numberToString(Math.round(nts * 100) / 100);
    return noFormat === true ? nts : window.formatMoney(nts);
};

window.toDecimals = function toDecimals(n, d) {
    n = (n && n.value || n);
    d = (d && d.value || d);
    if (!n || !d) {
        return "0";
    }
    var decimals = (typeof d).toLowerCase() === 'string' ? parseInt(d) : d;
    var symbol = window.toEthereumSymbol(decimals);
    if (symbol) {
        return window.web3.utils.toWei((typeof n).toLowerCase() === 'string' ? n : window.numberToString(n), symbol);
    }
    var number = (typeof n).toLowerCase() === 'string' ? parseInt(n) : n;
    if (!number || this.isNaN(number)) {
        return 0;
    }
    return window.numberToString(number * (decimals < 2 ? 1 : Math.pow(10, decimals)));
};

window.loadContent = async function loadContent(tokenId, ocelotAddress, raw) {
    var metadata = await window.loadContentMetadata(tokenId, ocelotAddress);
    var chains = [];
    var ocelot = window.newContract(window.context.OcelotAbi, (!ocelotAddress || ocelotAddress === window.voidEthereumAddress) ? window.getNetworkElement('defaultOcelotTokenAddress') : ocelotAddress);
    for (var i = 0; i < metadata[0]; i++) {
        var content = await window.blockchainCall(ocelot.methods.content, tokenId, i);
        chains.push(i === 0 ? content : content.substring(2));
    }
    var value = chains.join('');
    value = window.web3.utils.toUtf8(value).trim();
    value = raw ? value : Base64.decode(value.substring(value.indexOf(',')));
    var regex = new RegExp(window.base64Regex).exec(value);
    !raw && regex && regex.index === 0 && (value = Base64.decode(value.substring(value.indexOf(','))));
    return value;
};

window.loadContentMetadata = async function loadContentMetadata(tokenId, ocelotAddress) {
    var ocelot = window.newContract(window.context.OcelotAbi, (!ocelotAddress || ocelotAddress === window.voidEthereumAddress) ? window.getNetworkElement('defaultOcelotTokenAddress') : ocelotAddress);
    var metadata = await window.blockchainCall(ocelot.methods.metadata, tokenId);
    metadata[0] = parseInt(metadata[0]);
    metadata[1] = parseInt(metadata[1]) * 2 + 4;
    return metadata;
};

window.getCompleteCode = async function getCompleteCode(code, alreadyLoaded) {
    alreadyLoaded = alreadyLoaded || [];
    var matches = code.match(new RegExp(window.solidityImportRule));
    if (!matches || matches.length === 0) {
        return code;
    }
    var tokens = matches.map(it => parseInt(it.split('"')[1]));
    for (var i in tokens) {
        var token = tokens[i];
        if (alreadyLoaded.filter(it => it === token).length > 0) {
            continue;
        }
        alreadyLoaded.push(token);
        var cached = window.getCodeCache()[token];
        cached = cached || {
            code: await window.loadContent(token)
        };
        cached.lastUsed = new Date().getTime();
        window.codeCache[token] = cached;
        code = code.split(matches[i]).join(cached.code.replace(new RegExpr(window.pragmaSolidityRule), ""));
    }
    return await window.getCompleteCode(code);
};

window.getCodeCache = function getCodeCache() {
    window.codeCache = window.codeCache || {};
    Object.keys(window.codeCache).map(key => {
        var cached = window.codeCache[key];
        if (new Date().getTime() > (cached.lastUsed + (60000 * 5))) {
            delete window.cache[key];
        }
    });
    return window.codeCache;
};

window.split = function split(content, length) {
    var regex = new RegExp(window.base64Regex).exec(content);
    content = regex && regex.index === 0 ? content : ('data:text/plain;base64,' + Base64.encode(content));
    var data = window.web3.utils.fromUtf8(content);
    var inputs = [];
    var defaultLength = (length || window.context.singleTokenLength) - 2;
    if (data.length <= defaultLength) {
        inputs.push(data);
    } else {
        while (data.length > 0) {
            var length = data.length < defaultLength ? data.length : defaultLength;
            var piece = data.substring(0, length);
            data = data.substring(length);
            if (inputs.length > 0) {
                piece = '0x' + piece;
            }
            inputs.push(piece);
        }
    }
    return inputs;
};

window.mint = async function mint(inputs, ocelotAddress, silent, firstChunkCallback, tokenId, start) {
    var ocelot = window.newContract(window.context.OcelotAbi, ocelotAddress || (!ocelotAddress || ocelotAddress === window.voidEthereumAddress) ? window.getNetworkElement('defaultOcelotTokenAddress') : ocelotAddress);
    inputs = (typeof inputs).toLowerCase() === 'string' ? window.split(inputs) : inputs;
    for (var i = start || 0; i < inputs.length; i++) {
        var input = inputs[i];
        !silent && $.publish('message', "Minting " + (i + 1) + " of " + inputs.length + " tokens", "info");
        var method = ocelot.methods['mint' + (i === inputs.length - 1 ? 'AndFinalize' : '') + (i === 0 ? '' : ('(uint256,bytes)'))];
        var args = [
            method
        ];
        i > 0 && args.push(tokenId)
        args.push(input);
        var txReceipt = await window.blockchainCall.apply(window, args);
        if (!tokenId) {
            tokenId = parseInt(txReceipt.events.Minted.returnValues.tokenId);
            firstChunkCallback && firstChunkCallback(tokenId);
        }
    }
    return tokenId;
};

window.numberToString = function numberToString(num, locale) {
    if (num === undefined || num === null) {
        num = 0;
    }
    if ((typeof num).toLowerCase() === 'string') {
        return num;
    }
    let numStr = String(num);

    if (Math.abs(num) < 1.0) {
        let e = parseInt(num.toString().split('e-')[1]);
        if (e) {
            let negative = num < 0;
            if (negative) num *= -1
            num *= Math.pow(10, e - 1);
            numStr = '0.' + (new Array(e)).join('0') + num.toString().substring(2);
            if (negative) numStr = "-" + numStr;
        }
    } else {
        let e = parseInt(num.toString().split('+')[1]);
        if (e > 20) {
            e -= 20;
            num /= Math.pow(10, e);
            numStr = num.toString() + (new Array(e + 1)).join('0');
        }
    }
    if (locale === true) {
        var numStringSplitted = numStr.split(' ').join('').split('.');
        return parseInt(numStringSplitted[0]).toLocaleString() + (numStringSplitted.length === 1 ? '' : (Utils.decimalsSeparator + numStringSplitted[1]))
    }
    return numStr;
};

window.onload = function() {
    Main().catch(function(e) {
        return alert(e.message || e);
    });
};

window.extractComment = function extractComment(code, element) {
    if (code === undefined || code === null) {
        return '';
    }
    code = code.split('\r').join('').trim();
    if (!element) {
        var comments = {};
        ['Description', 'Discussion', 'Update'].map(key => comments[key] = window.extractComment(code, key));
        comments.Discussion && (comments.Discussion = window.formatLink(comments.Discussion));
        return comments;
    }
    var initialCode = '/* ' + element + ':\n';
    var finalCode = '\n */\n';
    var start = code.indexOf(initialCode);
    if (start === -1) {
        return '';
    }
    start += initialCode.length;
    var end = code.indexOf(finalCode, start);
    end = end === -1 ? code.indexOf(finalCode.substring(0, finalCode.length - 1), start) : end;
    var data = code.substring(start, end);
    var split = data.split('\n');
    for (var i = 0; i < split.length; i++) {
        var tag = split[i];
        if (tag.indexOf(' * ') === 0) {
            try {
                split[i] = tag = tag.substring(3).trim();
            } catch (e) {
                split[i] = tag = tag.substring(2).trim();
            }
        }
        if (tag.indexOf(' *') === 0) {
            try {
                split[i] = tag = tag.substring(2).trim();
            } catch (e) {
                split[i] = tag = tag.substring(1).trim();
            }
        }
    }
    return split.join('\n').trim();
};

window.putComment = function putComment(code, element, data) {
    if (code === undefined || code === null) {
        return;
    }
    code = code.split('\r').join('').trim();
    if (!element) {
        var data = window.extractComment(code);
        Object.keys(data).map(key => code = window.putComment(window.putComment(code, key, ''), key, data[key]).trim());
        return code;
    }
    data = (data || '').trim();
    var initialCode = '/* ' + element + ':\n';
    var finalCode = '\n */\n';
    var head = '';
    var tail = code;
    var start = code.indexOf(initialCode);
    if (start !== -1) {
        head = code.substring(0, start);
        var end = code.indexOf(finalCode, start);
        end = end === -1 ? code.indexOf(finalCode.substring(0, finalCode.length - 1), start) : end;
        end += finalCode.length;
        tail = code.substring(end);
    }
    if (data) {
        var split = data.split('\n');
        for (var i = 0; i < split.length; i++) {
            split[i] = " * " + split[i].trim();
        }
        data = split.join('\n');
        data = initialCode + data + finalCode;
    }
    return (head + data + tail).trim();
};

window.methodSignatureMatch = function methodSignatureMatch(methodSignature, compare) {
    for (var i in compare.abi) {
        var abi = compare.abi[i];
        if (abi.type === 'function' && abi.name + '(' + abi.inputs.map(it => it.type).join(',') + ')' === methodSignature) {
            return true;
        }
    }
    return false;
};

window.extractHTMLDescription = function extractHTMLDescription(code, updateFirst) {
    if (!code) {
        return '';
    }
    var description = '';
    var comments = typeof code === 'string' ? window.extractComment(code) : code;
    if (updateFirst) {
        comments.Update && (description += comments.Update);
        comments.Description && (description += ((comments.Update ? '<br/><br/><b>Description</b>:<br/>' : '') + comments.Description));
    } else {
        comments.Description && (description += comments.Description);
        comments.Update && (description += ((comments.Description ? '<br/><br/><b>Last Updates</b>:<br/>' : '') + comments.Update));
    }
    if (comments.Discussion) {
        description += '<a class="ComEXTLink" href="' + comments.Discussion + '" target="_blank"><b>Discussion Link</b></a><br/><br/>';
    }
    description = description.trim();
    description && (description = description.split('\n').join('<br/>').trim() + '<br/><br/>');
    return description;
}

window.searchForCodeErrors = async function searchForCodeErrors(location, code, codeName, methodSignature, replaces, noCode) {
    var knownFunctionalities = {
        "getMinimumBlockNumberForSurvey": true,
        "getMinimumBlockNumberForEmergencySurvey": true,
        "getEmergencySurveyStaking": true,
        "getQuorum": true,
        "getSurveySingleReward": true,
        "getMinimumStaking": true,
        "getIndex": true,
        "getLink": true,
        "getVotesHardCap": true,
        "getMetadataLink": true
    };
    var errors = [];
    var comments = code ? window.extractComment(code) : {};
    if ((codeName || !replaces) && !code) {
        //errors.push('Missing code!');
        errors.push('On-chain data not available');
        errors.push('https://etherscan.io/address/' + location + '#code');
        errors.push('(IPFS metadata coming soon)');
    }
    if ((codeName || (!codeName && !replaces)) && code && !comments.Description) {
        errors.push('Missing description!');
    }
    if ((codeName || (!codeName && !replaces)) && code && !comments.Discussion) {
        !knownFunctionalities[codeName] && errors.push('Missing discussion Link!');
    }
    if (codeName && replaces && !comments.Update) {
        errors.push('Missing update text!');
    }
    if (codeName && !location) {
        errors.push('Missing location address!');
    }
    if (codeName && !methodSignature) {
        errors.push('Missing method signature!');
    }
    if (!location || !code || noCode === true) {
        return errors;
    }
    try {
        var compare = await window.SolidityUtilities.compare(location, code);
        if (!compare) {
            errors.push('Code and location are not aligned');
        }
        if (compare) {
            var increment = 0;
            for (var i in compare.abi) {
                var element = compare.abi[i];
                if (element.type === 'function') {
                    increment++;
                    if (element.type === 'constructor' || element.stateMutability === 'view' || element.stateMutability === 'pure') {
                        increment--;
                    } else if (element.name === 'onStart' && element.inputs.length === 2 && element.inputs[0].type === 'address' && element.inputs[1].type === 'address') {
                        increment--;
                    } else if (element.name === 'onStop' && element.inputs.length === 1 && element.inputs[0].type === 'address') {
                        increment--;
                    }
                }
            }
            if (increment > 1) {
                errors.push('Possible Security Issue: This contract contains more than 1 public method');
            }
        }
        if (compare && codeName && !window.methodSignatureMatch(methodSignature, compare)) {
            errors.push('Wrong Method signature ' + methodSignature + ' for the given contract!');
        }
        if (compare) {
            var constraints = window.checkMandatoryFunctionalityProposalConstraints(compare.abi, !codeName, true);
            constraints && errors.push(...constraints);
        }
    } catch (e) {}
    return errors;
};

window.checkMandatoryFunctionalityProposalConstraints = function checkMandatoryFunctionalityProposalConstraints(abi, isOneTime, noMetadata) {
    var mandatoryFunctionalityProposalConstraints = {
        onStart: isOneTime === true,
        onStop: isOneTime === true,
        getMetadataLinkConstructor: false,
        getMetadataLink: false
    };
    for (var voice of abi) {
        if (!mandatoryFunctionalityProposalConstraints.getMetadataLinkConstructor) {
            mandatoryFunctionalityProposalConstraints.getMetadataLinkConstructor = voice.type === 'constructor' && voice.inputs && voice.inputs.length >= 1 && voice.inputs[0].type === 'string' && voice.inputs[0].name === 'metadataLink';
        }
        if (!mandatoryFunctionalityProposalConstraints.getMetadataLink) {
            mandatoryFunctionalityProposalConstraints.getMetadataLink = voice.type === 'function' && voice.name === 'getMetadataLink' && voice.stateMutability === 'view' && voice.inputs.length === 0 && voice.outputs.length === 1 && voice.outputs[0].type === 'string';
        }
        if (!mandatoryFunctionalityProposalConstraints.onStart) {
            mandatoryFunctionalityProposalConstraints.onStart = voice.type === 'function' && voice.name === 'onStart' && voice.stateMutability !== "view" && voice.stateMutability !== "pure" && (!voice.outputs || voice.outputs.length === 0) && voice.inputs && voice.inputs.length === 2 && voice.inputs[0].type === 'address' && voice.inputs[1].type === 'address';
        }
        if (!mandatoryFunctionalityProposalConstraints.onStop) {
            mandatoryFunctionalityProposalConstraints.onStop = voice.type === 'function' && voice.name === 'onStop' && voice.stateMutability !== "view" && voice.stateMutability !== "pure" && (!voice.outputs || voice.outputs.length === 0) && voice.inputs && voice.inputs.length === 1 && voice.inputs[0].type === 'address';
        }
    }
    var errors = [];
    noMetadata !== true && !mandatoryFunctionalityProposalConstraints.getMetadataLinkConstructor && errors.push("Microservices must have a constructor with a string variable called 'metadataLink' as first parameter");
    noMetadata !== true && !mandatoryFunctionalityProposalConstraints.getMetadataLink && errors.push("Missing mandatory function getMetadataLink() public view returns(string memory)");
    !mandatoryFunctionalityProposalConstraints.onStart && errors.push("Missing mandatory function onStart(address,address) public");
    !mandatoryFunctionalityProposalConstraints.onStop && errors.push("Missing mandatory function onStop(address) public");
    return errors;
};

window.tokenPercentage = function tokenPercentage(amount, totalSupply) {
    amount = (amount && amount.value) || amount;
    amount = (typeof amount).toLowerCase() === 'string' ? parseInt(amount) : amount;
    totalSupply = (totalSupply && totalSupply.value) || totalSupply;
    totalSupply = (typeof totalSupply).toLowerCase() === 'string' ? parseInt(totalSupply) : totalSupply;
    if (!amount) {
        return '0%';
    }

    var percentage = (amount / (totalSupply / 100));
    return Math.round(percentage) + '%';
};

window.getDFOLogs = async function getDFOLogs(args) {
    window.dfoEvent = window.dfoEvent || window.web3.utils.sha3('Event(string,bytes32,bytes32,bytes)');
    var logArgs = {
        topics: [
            window.dfoEvent
        ],
        fromBlock: '0',
        toBlock: 'latest'
    };
    args.address && (logArgs.address = args.address);
    args.event && logArgs.topics.push(args.event.indexOf('0x') === 0 ? args.event : window.web3.utils.sha3(args.event));
    args.topics && logArgs.topics.push(...args.topics);
    args.fromBlock && (logArgs.fromBlock = args.fromBlock);
    args.toBlock && (logArgs.toBlock = args.toBlock);
    return window.formatDFOLogs(await window.getLogs(logArgs), args.event && args.event.indexOf('0x') === -1 ? args.event : undefined);
};

window.formatDFOLogs = function formatDFOLogs(logVar, event) {
    if (!logVar || (!this.isNaN(logVar.length) && logVar.length === 0)) {
        return logVar;
    }
    var logs = [];
    if (logVar.length) {
        logs.push(...logVar);
    } else {
        event = event || logVar.event;
        logs.push(logVar);
    }
    var deployArgs = [];
    if (event) {
        var rebuiltArgs = event.substring(event.indexOf('(') + 1);
        rebuiltArgs = JSON.parse('["' + rebuiltArgs.substring(0, rebuiltArgs.indexOf(')')).split(',').join('","') + '"]');
        for (var i in rebuiltArgs) {
            if (!rebuiltArgs[i].endsWith('_indexed')) {
                deployArgs.push(rebuiltArgs[i]);
            }
        }
    }
    window.dfoEvent = window.dfoEvent || window.web3.utils.sha3('Event(string,bytes32,bytes32,bytes)');
    var eventTopic = event && window.web3.utils.sha3(event);
    var manipulatedLogs = [];
    for (var i in logs) {
        var log = logs[i];
        if (log.topics && log.topics[0] !== window.dfoEvent) {
            continue;
        }
        log.topics && log.topics.splice(0, 1);
        if (eventTopic && log.topics && log.topics[0] !== eventTopic) {
            continue;
        }
        log.raw && log.raw.topics && log.raw.topics.splice(0, 1);
        try {
            log.data && (log.data = web3.eth.abi.decodeParameter("bytes", log.data));
            log.raw && log.raw.data && (log.raw.data = web3.eth.abi.decodeParameter("bytes", log.raw.data));
        } catch (e) {}
        if (deployArgs.length > 0 && (deployArgs.length > 1 || deployArgs[0] !== "")) {
            var data = web3.eth.abi.decodeParameters(deployArgs, log.data || (log.raw && log.raw.data));
            log.data && (log.data = []);
            log.raw && log.raw.data && (log.raw.data = []);
            Object.keys(data).map(key => {
                if (isNaN(parseInt(key))) {
                    return;
                }
                log.data && log.data.push(data[key]);
                log.raw && log.raw.data && log.raw.data.push(data[key]);
            });
        }
        manipulatedLogs.push(log);
    }
    return logVar.length ? manipulatedLogs : manipulatedLogs[0] || logVar;
};

window.sendGeneratedProposal = function sendGeneratedProposal(element, ctx, template, lines, descriptions, updates, prefixedLines, postFixedLines) {
    var initialContext = {
        element,
        functionalityName: '',
        functionalitySubmitable: true,
        functionalityMethodSignature: 'callOneTime(address)',
        functionalityReplace: '',
        functionalityInternal: false,
        functionalityNeedsSender: false,
        functionalityReplace: '',
        emergency: false,
        template,
        lines,
        descriptions,
        updates,
        prefixedLines,
        postFixedLines,
        sequentialOps: template && [{
            name: 'Generating Smart Contract proposal',
            async call(data) {
                var generatedAndCompiled = await window.generateAndCompileContract(data.template, data.lines, data.descriptions, data.updates, data.prefixedLines, data.postFixedLines);
                data.sourceCode = generatedAndCompiled.sourceCode;
                data.selectedContract = generatedAndCompiled.selectedContract;
            }
        }]
    }
    ctx = ctx || {};
    ctx.sequentialOps && ctx.sequentialOps.push(initialContext.sequentialOps[0]);
    Object.keys(ctx).map(key => initialContext[key] = ctx[key]);
    window.showProposalLoader(initialContext);
};

window.generateAndCompileContract = async function generateAndCompileContract(sourceCode, lines, descriptions, updates, prefixedLines, postFixedLines) {
    sourceCode = JSON.parse(JSON.stringify(sourceCode));
    var bodyStart = 3;
    for (var i = 0; i < sourceCode.length; i++) {
        if (sourceCode[i].trim().toLowerCase() === 'function_body') {
            bodyStart = i;
            sourceCode.splice(bodyStart, 1);
            break;
        }
    }

    if (lines && lines.length) {
        for (var i = lines.length - 1; i >= 0; i--) {
            lines[i] !== 'undefined' && lines[i] !== 'null' && sourceCode.splice(bodyStart, 0, '        ' + lines[i]);
        }
    }

    if (prefixedLines && prefixedLines.length) {
        sourceCode.splice(2, 0, "");
        for (var i = prefixedLines.length - 1; i >= 0; i--) {
            prefixedLines[i] !== 'undefined' && prefixedLines[i] !== 'null' && sourceCode.splice(2, 0, '    ' + prefixedLines[i]);
        }
    }

    var compilers = (await window.SolidityUtilities.getCompilers()).releases;
    var version = Object.keys(compilers)[0];
    sourceCode.unshift('');
    sourceCode.unshift('pragma solidity ^' + version + ';');

    if (updates && updates.length) {
        sourceCode.unshift(' */');
        for (var i = updates.length - 1; i >= 0; i--) {
            sourceCode.unshift(' * ' + updates[i]);
        }
        sourceCode.unshift('/* Update:');
    }

    sourceCode.unshift(' */');
    for (var i = descriptions.length - 1; i >= 0; i--) {
        sourceCode.unshift(' * ' + descriptions[i]);
    }
    sourceCode.unshift('/* Description:');

    if (postFixedLines && postFixedLines.length) {
        sourceCode.push('');
        postFixedLines.forEach(it => sourceCode.push(it));
    }

    sourceCode = sourceCode.join('\n');
    return {
        sourceCode,
        selectedContract: (await window.SolidityUtilities.compile(sourceCode, compilers[version])).optimized.DFOHubGeneratedProposal
    }
};

window.showProposalLoader = async function showProposalLoader(initialContext) {
    var sequentialOps = initialContext.sequentialOps || [];
    delete initialContext.sequentialOps;
    window.functionalitySourceId && (initialContext.functionalitySourceId = window.functionalitySourceId);
    (!initialContext.functionalitySourceId && (initialContext.sourceCode || initialContext.template)) && sequentialOps.push({
        name: "On-Chain Smart Contract Validation",
        description: 'Deploying a Smart Contract validation, the code will be save in the Ethereum Blockchain via base64. This action is expensive, but in some cases very important.',
        async call(data, bypass) {
            if (bypass) {
                data.functionalitySourceId = '0';
                data.functionalitySourceLocation = window.voidEthereumAddress;
                data.bypassFunctionalitySourceId = true;
                return;
            }
            data.functionalitySourceId = await window.mint(window.split(data.sourceCode), undefined, true);
            data.editor && data.editor.contentTokenInput && (data.editor.contentTokenInput.value = data.functionalitySourceId);
        },
        bypassable: true,
        async onTransaction(data, transaction) {
            window.ocelotMintedEvent = window.ocelotMintedEvent || window.web3.utils.sha3("Minted(uint256,uint256,uint256)");
            window.ocelotFinalizedEvent = window.ocelotFinalizedEvent || window.web3.utils.sha3("Finalized(uint256,uint256)");
            for (var log of transaction.logs) {
                if (log.topics[0] === window.ocelotMintedEvent || log.topics[0] === window.ocelotFinalizedEvent) {
                    data.functionalitySourceId = window.web3.eth.abi.decodeParameter('uint256', log.topics[1]);
                    data.editor && data.editor.contentTokenInput && (data.editor.contentTokenInput.value = data.functionalitySourceId);
                    break;
                }
            }
        }
    });
    (!initialContext.functionalityAddress && (initialContext.selectedContract || initialContext.template || initialContext.functionalitySourceId || initialContext.sourceCode)) && sequentialOps.push({
        name: "Deploying Smart Contract",
        async call(data) {
            if (data.contractName && data.functionalitySourceId && data.selectedSolidityVersion) {
                var code = data.bypassFunctionalitySourceId ? data.sourceCode : await window.loadContent(data.functionalitySourceId);
                var compiled = await window.SolidityUtilities.compile(code, data.selectedSolidityVersion, 200);
                data.selectedContract = compiled[data.contractName];
            }
            var args = [
                data.selectedContract.abi,
                data.selectedContract.bytecode,
                await window.generateFunctionalityMetadataLink(data)
            ];
            data.constructorArguments && Object.keys(data.constructorArguments).map(key => args.push(data.constructorArguments[key]));
            data.functionalityAddress = (await window.createContract.apply(window, args)).options.address;
            data.editor && data.editor.functionalityAddress && (data.editor.functionalityAddress.value = data.functionalityAddress);
        },
        async onTransaction(data, transaction) {
            data.functionalityAddress = transaction.contractAddress;
            data.editor && data.editor.functionalityAddress && (data.editor.functionalityAddress.value = data.functionalityAddress);
        }
    });
    if (initialContext.emergency) {
        var approved = parseInt(await window.blockchainCall(initialContext.element.token.methods.allowance, window.walletAddress, initialContext.element.dFO.options.address));
        approved < parseInt(initialContext.element.emergencySurveyStaking) && sequentialOps.push({
            name: 'Approving ' + window.fromDecimals(initialContext.element.emergencySurveyStaking, initialContext.element.decimals) + ' ' + initialContext.element.symbol + ' for Emergency Staking',
            async call(data) {
                var approved = parseInt(await window.blockchainCall(data.element.token.methods.allowance, window.walletAddress, data.element.dFO.options.address));
                if (approved >= parseInt(data.element.emergencySurveyStaking)) {
                    return;
                }
                await window.blockchainCall(data.element.token.methods.approve, initialContext.element.dFO.options.address, data.element.emergencySurveyStaking);
            }
        });
    }
    sequentialOps.push({
        name: 'Publishing Proposal...',
        async call(data) {
            data.transaction = await window.blockchainCall(
                data.element.dFO.methods.newProposal,
                data.functionalityName,
                data.emergency,
                window.getNetworkElement('defaultOcelotTokenAddress'),
                isNaN(data.functionalitySourceId) ? 0 : data.functionalitySourceId,
                window.hasEthereumAddress(data.functionalityAddress) ? data.functionalityAddress : window.voidEthereumAddress,
                data.functionalitySubmitable,
                data.functionalityMethodSignature || "",
                data.functionalityOutputParameters || "",
                data.functionalityInternal,
                data.functionalityNeedsSender,
                data.functionalityReplace
            );
            if (!parseInt(data.element.minimumStaking)) {
                $.publish('loader/toggle', false);
                $.publish('message', 'Proposal Sent!', 'info');
                $.publish('section/change', 'Proposals');
            }
        },
        actionName: "Publish"
    });
    !isNaN(parseInt(initialContext.element.minimumStaking)) && parseInt(initialContext.element.minimumStaking) > 0 && sequentialOps.push({
        name: 'Sending Initial ' + window.fromDecimals(initialContext.element.minimumStaking, initialContext.element.decimals) + ' ' + initialContext.element.symbol + ' for Staking',
        async call(data) {
            await window.blockchainCall(window.newContract(window.context.propsalAbi, data.transaction.events.Proposal.returnValues.proposal).methods.accept, window.numberToString(data.element.minimumStaking));
            $.publish('loader/toggle', false);
            $.publish('message', 'Proposal Sent!', 'info');
            $.publish('section/change', 'Proposals');
        },
        actionName: "Accept"
    });
    $.publish('loader/toggle', [true, sequentialOps, initialContext]);
};

window.toEthereumSymbol = function toEthereumSymbol(decimals) {
    var symbols = {
        "noether": "0",
        "wei": "1",
        "kwei": "1000",
        "Kwei": "1000",
        "babbage": "1000",
        "femtoether": "1000",
        "mwei": "1000000",
        "Mwei": "1000000",
        "lovelace": "1000000",
        "picoether": "1000000",
        "gwei": "1000000000",
        "Gwei": "1000000000",
        "shannon": "1000000000",
        "nanoether": "1000000000",
        "nano": "1000000000",
        "szabo": "1000000000000",
        "microether": "1000000000000",
        "micro": "1000000000000",
        "finney": "1000000000000000",
        "milliether": "1000000000000000",
        "milli": "1000000000000000",
        "ether": "1000000000000000000",
        "kether": "1000000000000000000000",
        "grand": "1000000000000000000000",
        "mether": "1000000000000000000000000",
        "gether": "1000000000000000000000000000",
        "tether": "1000000000000000000000000000000"
    };
    var d = "1" + (new Array(decimals + 1)).join('0');
    var values = Object.entries(symbols);
    for (var i in values) {
        var symbol = values[i];
        if (symbol[1] === d) {
            return symbol[0];
        }
    }
};

window.dumpFunctionalities = async function dumpFunctionalities(dfo) {
    await window.loadFunctionalities(dfo, undefined, true);
    var entries = ["        IMVDFunctionalitiesManager functionalitiesManager = IMVDFunctionalitiesManager(address(0));"];
    entries.push(...Object.values(dfo.functionalities).map(it => `functionalitiesManager.addFunctionality("${it.codeName}", ${window.web3.utils.toChecksumAddress(it.sourceLocation)}, ${it.sourceLocationId}, ${window.web3.utils.toChecksumAddress(it.location)}, ${it.submitable}, "${it.methodSignature}", '${JSON.stringify(it.returnAbiParametersArray)}', ${it.isInternal}, ${it.needsSender});`));
    return entries.join('\n        ');
};

window.formatMoney = function formatMoney(value, decPlaces, thouSeparator, decSeparator) {
    value = (typeof value).toLowerCase() !== 'number' ? parseFloat(value) : value;
    var n = value,
        decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
        decSeparator = decSeparator == undefined ? "." : decSeparator,
        thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
        sign = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    var result = sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
    return window.eliminateFloatingFinalZeroes(result, decSeparator);
};

window.AJAXRequest = function AJAXRequest(link, timeout, toU) {
    var toUpload = toU !== undefined && toU !== null && typeof toU !== 'string' ? JSON.stringify(toU) : toU;
    var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
    return new Promise(function(ok, ko) {
        var going = true;
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                if (going) {
                    going = false;
                    var response = xmlhttp.responseText;
                    try {
                        response = JSON.parse(response);
                    } catch (e) {}
                    ok(response);
                }
                try {
                    xmlhttp.abort();
                } catch (e) {
                    console.error(e);
                }
            }
        }
        xmlhttp.onloadend = function onloadend() {
            if (xmlhttp.status == 404) {
                return ko(404);
            }
        };
        xmlhttp.open(toUpload ? 'POST' : 'GET', link + (link.indexOf('?') === -1 ? '?' : '&') + ('cached_' + new Date().getTime()) + '=' + (new Date().getTime()), true);
        try {
            toUpload ? xmlhttp.send(toUpload) : xmlhttp.send();
        } catch (e) {
            return ko(e);
        }
        (timeout !== undefined && timeout !== null) && setTimeout(function() {
            if (!going) {
                return;
            }
            going = false;
            try {
                xmlhttp.abort();
            } catch (e) {
                console.error(e);
            }
            ko();
        }, timeout);
    });
};

window.getEthereumPrice = async function getEthereumPrice() {
    if (window.lastEthereumPrice && window.lastEthereumPrice.requestExpires > new Date().getTime() && window.lastEthereumPrice.price !== 0) {
        return window.lastEthereumPrice.price;
    }
    var price = 0;
    try {
        price = (await window.AJAXRequest(window.context.coingeckoEthereumPriceURL))[0].current_price;
    } catch (e) {}
    return (window.lastEthereumPrice = {
        price,
        requestExpires: new Date().getTime() + window.context.coingeckoEthereumPriceRequestInterval
    }).price;
};

window.shortenWord = function shortenWord(word, charsAmount) {
    return word ? word.substring(0, word.length < (charsAmount = charsAmount || window.context.defaultCharsAmount) ? word.length : charsAmount) + (word.length < charsAmount ? '' : '...') : "";
};

window.loadLogo = async function loadLogo(address) {
    address = window.web3.utils.toChecksumAddress(address);
    window.logos = window.logos || {};
    if(window.logos[address]) {
        return window.logos[address];
    }
    var logo = address === window.voidEthereumAddress ? 'assets/img/eth-logo.png' : window.context.trustwalletImgURLTemplate.format(address);
    try {
        await window.AJAXRequest(logo);
    } catch (e) {
        logo = 'assets/img/default-logo.png';
    }
    return logo;
};

window.loadOffChainWallets = async function loadOffChainWallets() {
    window.loadedTokens = window.loadedTokens || {};
    var loadLogoWork = async function loadLogoWork(token) {
        token.logoURI = token.logoURI || window.context.trustwalletImgURLTemplate.format(window.web3.utils.toChecksumAddress(token.address));
        token.logoURI = window.formatLink(token.logoURI);
        try {
            await window.AJAXRequest(token.logoURI);
        } catch (e) {
            token.logoURI = 'assets/img/default-logo.png'
        }
        token.logo = token.logoURI;
    };
    return await (window.tokensList = window.tokensList || new Promise(async function(ok) {
        var tokensList = {
            "Programmable Equities": (await window.AJAXRequest(window.getNetworkElement("decentralizedFlexibleOrganizationsURL"))).tokens.map(it => it.chainId === window.networkId && it),
            "Tokens": (await window.AJAXRequest(window.context.uniswapTokensURL)).tokens.map(it => it.chainId === window.networkId && it),
            "Indexes": (await window.AJAXRequest(window.context.indexesURL)).tokens.map(it => it.chainId === window.networkId && it)
        }
        tokensList.Tokens.push(...(await window.AJAXRequest(window.context.itemsListURL)).tokens.map(it => it.chainId === window.networkId && it));
        var keys = Object.keys(tokensList);
        for (var key of keys) {
            if (key === 'Indexes') {
                continue;
            }
            var tokens = tokensList[key];
            for (var i = 0; i < tokens.length; i++) {
                var token = tokensList[key][i];
                if (token === true || token === false) {
                    continue;
                }
                token.address = window.web3.utils.toChecksumAddress(token.address);
                token.listName = key;
                token.token = token.token || window.newContract(window.context.IERC20ABI, token.address);
                loadLogoWork(token);
                tokensList[key][i] = window.loadedTokens[token.address] = token;
            }
        }
        return ok(tokensList);
    }));
};

window.loadWallets = async function loadWallets(element, callback, alsoLogo) {
    window.preloadedTokens = window.preloadedTokens || await window.AJAXRequest('data/walletData.json');
    var network = window.context.ethereumNetwork[window.networkId];
    var tokens = JSON.parse(JSON.stringify(window.preloadedTokens["tokens" + (network || "")]));
    for (var i = 0; i < tokens.length; i++) {
        var token = window.newContract(window.context.IERC20ABI, tokens[i]);
        tokens[i] = {
            token,
            address: window.web3.utils.toChecksumAddress(tokens[i]),
            name: await window.blockchainCall(token.methods.name),
            symbol: await window.blockchainCall(token.methods.symbol),
            decimals: await window.blockchainCall(token.methods.decimals),
            logo: !alsoLogo ? undefined : await window.loadLogo(token.options.address)
        };
    }
    element !== window.dfoHub && tokens.unshift({
        token: window.dfoHub.token,
        address: window.web3.utils.toChecksumAddress(window.dfoHub.token.options.address),
        name: window.dfoHub.name,
        symbol: window.dfoHub.symbol,
        decimals: window.dfoHub.decimals,
        logo: !alsoLogo ? undefined : await window.loadLogo(window.dfoHub.token.options.address)
    });
    tokens.unshift({
        token: window.newContract(window.context.IERC20ABI, window.voidEthereumAddress),
        address: window.voidEthereumAddress,
        name: "Ethereum",
        symbol: "ETH",
        decimals: 18,
        logo: !alsoLogo ? undefined : await window.loadLogo(window.voidEthereumAddress)
    });
    tokens.unshift({
        token: element.token,
        address: window.web3.utils.toChecksumAddress(element.token.options.address),
        name: element.name,
        symbol: element.symbol,
        decimals: element.decimals,
        logo: !alsoLogo ? undefined : await window.loadLogo(element.token.options.address)
    });
    callback && callback(tokens);
    var values = Object.values(window.list);
    for (var it of values) {
        var address = window.web3.utils.toChecksumAddress(it.token.options.address);
        if ((it === window.dfoHub || it === element)) {
            continue;
        }
        var entry = {
            token: it.token,
            address,
            name: it.name,
            symbol: it.symbol,
            decimals: it.decimals,
            logo: !alsoLogo ? undefined : await window.loadLogo(it.token.options.address)
        };
        it !== window.dfoHub && it !== element && tokens.push(entry);
    }
    callback && callback(tokens);
};

window.loadUniswapPairs = async function loadUniswapPairs(view, address) {
    window.pairCreatedTopic = window.pairCreatedTopic || window.web3.utils.sha3('PairCreated(address,address,address,uint256)');
    address = window.web3.utils.toChecksumAddress(address || view.props.tokenAddress);
    view.address = address;
    view.setState({ uniswapPairs: null, selected: null });
    var wethAddress = window.web3.utils.toChecksumAddress(await window.blockchainCall(window.newContract(window.context.uniSwapV2RouterAbi, window.context.uniSwapV2RouterAddress).methods.WETH));
    if (address !== view.address) {
        return;
    }
    if (address === window.voidEthereumAddress) {
        view.address = address = wethAddress;
    }
    var myToken = window.web3.eth.abi.encodeParameter('address', address);
    var logs = await window.getLogs({
        address: window.context.uniSwapV2FactoryAddress,
        fromBlock: '0',
        topics: [
            window.pairCreatedTopic, [myToken]
        ]
    });
    logs.push(...(await window.getLogs({
        address: window.context.uniSwapV2FactoryAddress,
        fromBlock: '0',
        topics: [
            window.pairCreatedTopic, [],
            [myToken]
        ]
    })));
    if (address !== view.address) {
        return;
    }
    var uniswapPairs = [];
    var alreadyAdded = {};
    for (var log of logs) {
        for (var topic of log.topics) {
            if (topic === window.pairCreatedTopic || topic.toLowerCase() === myToken.toLowerCase()) {
                continue;
            }
            var pairTokenAddress = window.web3.utils.toChecksumAddress(window.web3.eth.abi.decodeParameters(['address', 'uint256'], log.data)[0]);
            if (alreadyAdded[pairTokenAddress]) {
                continue;
            }
            alreadyAdded[pairTokenAddress] = true;
            var pairToken = window.newContract(window.context.uniSwapV2PairAbi, pairTokenAddress);
            var token0 = window.web3.utils.toChecksumAddress(await window.blockchainCall(pairToken.methods.token0));
            if (address !== view.address) {
                return;
            }
            var reserves = await window.blockchainCall(pairToken.methods.getReserves);
            if (address !== view.address) {
                return;
            }
            var addr = window.web3.utils.toChecksumAddress(window.web3.eth.abi.decodeParameter('address', topic));
            var tokenInfo = await window.loadTokenInfos(addr, wethAddress);
            if (address !== view.address) {
                return;
            }
            tokenInfo.pairToken = pairToken;
            tokenInfo.mainReserve = reserves[address === token0 ? 0 : 1];
            tokenInfo.otherReserve = reserves[address === token0 ? 1 : 0];
            uniswapPairs.push(tokenInfo);
            view.enqueue(() => view.setState({ uniswapPairs }));
        }
    }
    uniswapPairs.length === 0 && view.enqueue(() => view.setState({ uniswapPairs }));
};

window.loadTokenInfos = async function loadTokenInfos(addresses) {
    window.loadedTokens = window.loadedTokens || {};
    var single = (typeof addresses).toLowerCase() === 'string';
    addresses = single ? [addresses] : addresses;
    var tokens = [];
    for (var address of addresses) {
        address = window.web3.utils.toChecksumAddress(address);
        var token = window.newContract(window.context.IERC20ABI, address);
        tokens.push(window.loadedTokens[address] || (window.loadedTokens[address] = {
            address,
            token,
            name: address === window.wethAddress ? 'Ethereum' : await window.blockchainCall(token.methods.name),
            symbol: address === window.wethAddress ? 'ETH' : await window.blockchainCall(token.methods.symbol),
            decimals: address === window.wethAddress ? '18' : await window.blockchainCall(token.methods.decimals),
            logo: await window.loadLogo(address === window.wethAddress ? window.voidEthereumAddress : address)
        }));
    }
    return single ? tokens[0] : tokens;
};

window.calculateTimeTier = function calculateTimeTier(blockLimit) {
    var tiers = Object.entries(window.context.blockTiers);
    for (var tier of tiers) {
        var steps = tier[1].averages;
        if (blockLimit >= steps[0] && blockLimit <= steps[2]) {
            return `~${tier[0].firstLetterToUpperCase()} (${blockLimit} blocks)`;
        }
    }
    return `${blockLimit} blocks`;
};

window.getTierKey = function getTierKey(blockLimit) {
    var tiers = Object.entries(window.context.blockTiers);
    for (var tier of tiers) {
        var steps = tier[1].averages;
        if (blockLimit >= steps[0] && blockLimit <= steps[2]) {
            return tier[0];
        }
    }
    return 'Custom';
};

window.calculateMultiplierAndDivider = function calculateMultiplierAndDivider(p) {
    p = (typeof p).toLowerCase() === 'string' ? parseFloat(p) : p;
    p = p / 100;
    var percentage = window.formatMoney(p, 9, '').split('.');
    var arr = [];
    arr[0] = percentage[0];
    arr[1] = '1';
    if (percentage.length > 1) {
        var i;
        for (i = percentage[1].length - 1; i >= 0; i--) {
            if (percentage[1][i] !== '0') {
                break;
            }
        }
        var afterFloat = percentage[1].substring(0, i === percentage[1].length ? i : (i + 1));
        arr[0] += afterFloat;
        arr[0] = window.numberToString(parseInt(arr[0]));
        arr[1] = '1';
        for (var i = 0; i < afterFloat.length; i++) {
            arr[1] += '0';
        }
        arr[1] = window.numberToString(parseInt(arr[1]));
    }
    return arr;
};

window.eliminateFloatingFinalZeroes = function eliminateFloatingFinalZeroes(value, decSeparator) {
    decSeparator = decSeparator || '.';
    if (value.indexOf(decSeparator) === -1) {
        return value;
    }
    var split = value.split(decSeparator);
    while (split[1].endsWith('0')) {
        split[1] = split[1].substring(0, split[1].length - 1);
    }
    return split[1].length === 0 ? split[0] : split.join(decSeparator);
};

function getPage() {
    var location;
    try {
        var search = window.addressBarParams || {};
        var splits = window.location.search.split('?');
        for (var z in splits) {
            var split = splits[z].trim();
            if (split.length === 0) {
                continue;
            }
            split = split.split('&');
            for (var i in split) {
                var data = split[i].trim();
                if (data.length === 0) {
                    continue;
                }
                data = data.split('=');
                data[1] = window.decodeURIComponent(data[1]);
                if (!search[data[0]]) {
                    search[data[0]] = data[1];
                } else {
                    var value = search[data[0]];
                    if (typeof value !== 'object') {
                        value = [value];
                    }
                    value.push(data[1]);
                    search[data[0]] = value;
                }
            }
        }
        window.addressBarParams = search;
        location = window.addressBarParams.location;
    } catch (e) {}
    //window.history.pushState({}, "", window.location.protocol + '//' + window.location.host);
    return location;
};

window.loadStakingData = async function loadStakingData(contracts) {
    var blockTiers = {};
    Object.keys(window.context.blockTiers).splice(2, Object.keys(window.context.blockTiers).length).forEach(it => blockTiers[it] = window.context.blockTiers[it]);
    var stakingData = [];
    for (var contract of contracts) {
        contract = window.web3.utils.toChecksumAddress(contract);
        var stakingManager = window.newContract(window.context.LiquidityMiningContractABI, contract);
        stakingData.push(await window.setStakingManagerData(stakingManager, blockTiers, true));
    }
    return { stakingData, blockTiers };
};

window.setStakingManagerData = async function setStakingManagerData(stakingManager, blockTiers, active) {
    var stakingManagerData = {
        stakingManager,
        active,
        blockTiers
    };
    try {
        stakingManagerData.mainToken = await window.loadTokenInfos(await window.blockchainCall(stakingManager.methods.tokenAddress));
        stakingManagerData.rewardToken = await window.loadTokenInfos(await window.blockchainCall(stakingManager.methods.rewardTokenAddress));
    } catch(e) {
    }
    stakingManagerData.startBlock = await window.blockchainCall(stakingManager.methods.startBlock);
    try {
        stakingManagerData.endBlock = await window.blockchainCall(stakingManager.methods.endBlock);
        if(active) {
            var currentBlock = await window.web3.eth.getBlockNumber();
            if(currentBlock > parseInt(stakingManagerData.endBlock)) {
                stakingManagerData.active = false;
            }
        }
    } catch(e) {
    }
    var blockNumber = await window.web3.eth.getBlockNumber();
    stakingManagerData.started = blockNumber > parseInt(stakingManagerData.startBlock);
    stakingManagerData.terminated = stakingManagerData.endBlock && blockNumber > parseInt(stakingManagerData.endBlock);
    stakingManagerData.running = stakingManagerData.started && !stakingManagerData.terminated;
    var rawTiers = await window.blockchainCall(stakingManager.methods.tierData);
    var pools = await window.blockchainCall(stakingManager.methods.tokens);
    stakingManagerData.startBlock = await window.blockchainCall(stakingManager.methods.startBlock);
    var pairs = await window.loadTokenInfos(pools, window.wethAddress);
    for (var i in pairs) {
        pairs[i].amount = await window.blockchainCall(stakingManager.methods.totalPoolAmount, i);
    }
    var tiers = [];
    for (var i = 0; i < rawTiers[0].length; i++) {
        var tier = {
            blockNumber: rawTiers[0][i],
            percentage: 100 * parseFloat(rawTiers[1][i]) / parseFloat(rawTiers[2][i]),
            rewardSplitTranche: rawTiers[3][i],
            time: window.calculateTimeTier(rawTiers[0][i]),
            tierKey: window.getTierKey(rawTiers[0][i])
        };
        var stakingInfo = await window.blockchainCall(stakingManager.methods.getStakingInfo, i);
        tier.minCap = stakingInfo[0];
        tier.hardCap = stakingInfo[1];
        tier.remainingToStake = stakingInfo[2];
        tier.staked = window.web3.utils.toBN(tier.hardCap).sub(window.web3.utils.toBN(tier.remainingToStake)).toString()
        tiers.push(tier);
    }
    stakingManagerData.pairs = pairs;
    stakingManagerData.tiers = tiers;
    return stakingManagerData;
};

window.updateInfo = async function updateInfo(view, element) {
    if (!element || element.updating) {
        return;
    }
    element.updating = true;

    var votingTokenAddress;
    var stateHolderAddress;
    var functionalitiesManagerAddress;
    element.walletAddress = element.dFO.options.address;

    try {
        var delegates = await window.web3.eth.call({
            to: element.dFO.options.address,
            data: element.dFO.methods.getDelegates().encodeABI()
        });
        try {
            delegates = window.web3.eth.abi.decodeParameter("address[]", delegates);
        } catch (e) {
            delegates = window.web3.eth.abi.decodeParameters(["address", "address", "address", "address", "address", "address"], delegates);
        }
        votingTokenAddress = delegates[0];
        stateHolderAddress = delegates[2];
        functionalitiesManagerAddress = delegates[4];
        element.walletAddress = delegates[5];
        element.doubleProxyAddress = delegates[6];
    } catch (e) {}

    if (!votingTokenAddress) {
        votingTokenAddress = await window.blockchainCall(element.dFO.methods.getToken);
        stateHolderAddress = await window.blockchainCall(element.dFO.methods.getStateHolderAddress);
        functionalitiesManagerAddress = await window.blockchainCall(element.dFO.methods.getMVDFunctionalitiesManagerAddress);
        try {
            element.walletAddress = await window.blockchainCall(element.dFO.methods.getMVDWalletAddress);
        } catch (e) {}
    }

    if (!element.doubleProxyAddress) {
        try {
            element.doubleProxyAddress = await window.blockchainCall(element.dFO.methods.getDoubleProxyAddress);
        } catch (e) {}
    }

    element.token = window.newContract(window.context.IERC20ABI, votingTokenAddress);
    element.name = await window.blockchainCall(element.token.methods.name);
    element.symbol = await window.blockchainCall(element.token.methods.symbol);
    element.totalSupply = await window.blockchainCall(element.token.methods.totalSupply);
    try {
        element.metadata = await window.AJAXRequest(window.formatLink(element.metadataLink = window.web3.eth.abi.decodeParameter("string", await window.blockchainCall(element.dFO.methods.read, 'getMetadataLink', '0x'))));
        Object.entries(element.metadata).forEach(it => element[it[0]] = it[1] || element[it[0]]);
    } catch (e) {}
    element.decimals = await window.blockchainCall(element.token.methods.decimals);
    element.stateHolder = window.newContract(window.context.stateHolderAbi, stateHolderAddress);
    element.functionalitiesManager = window.newContract(window.context.functionalitiesManagerAbi, functionalitiesManagerAddress);
    element.functionalitiesAmount = parseInt(await window.blockchainCall(element.functionalitiesManager.methods.getFunctionalitiesAmount));
    element.lastUpdate = element.startBlock;
    window.refreshBalances(view, element);
    element.minimumBlockNumberForEmergencySurvey = '0';
    element.emergencySurveyStaking = '0';

    setTimeout(async function() {
        try {
            element.minimumBlockNumberForEmergencySurvey = window.web3.eth.abi.decodeParameter("uint256", await window.blockchainCall(element.dFO.methods.read, 'getMinimumBlockNumberForEmergencySurvey', '0x')) || '0';
            element.emergencySurveyStaking = window.web3.eth.abi.decodeParameter("uint256", await window.blockchainCall(element.dFO.methods.read, 'getEmergencySurveyStaking', '0x')) || '0';
        } catch (e) {}
        try {
            element.quorum = window.web3.eth.abi.decodeParameter("uint256", await window.blockchainCall(element.dFO.methods.read, 'getQuorum', '0x'));
        } catch (e) {
            element.quorum = "0";
        }
        try {
            element.surveySingleReward = window.web3.eth.abi.decodeParameter("uint256", await window.blockchainCall(element.dFO.methods.read, 'getSurveySingleReward', '0x'));
        } catch (e) {
            element.surveySingleReward = "0";
        }
        try {
            element.minimumStaking = window.web3.eth.abi.decodeParameter("uint256", await window.blockchainCall(element.dFO.methods.read, 'getMinimumStaking', '0x'));
        } catch (e) {
            element.minimumStaking = "0";
        }
        element.icon = window.makeBlockie(element.dFO.options.address);
        try {
            element.link = window.web3.eth.abi.decodeParameter("string", await window.blockchainCall(element.dFO.methods.read, 'getLink', '0x'));
        } catch (e) {}
        try {
            element.index = window.web3.eth.abi.decodeParameter("uint256", await window.blockchainCall(element.dFO.methods.read, 'getIndex', '0x'));
        } catch (e) {}
        try {
            element !== window.dfoHub && (element.ens = await window.blockchainCall(window.dfoHubENSResolver.methods.subdomain, element.dFO.options.originalAddress));
        } catch (e) {}
        element.votesHardCap = '0'
        try {
            element.votesHardCap = window.web3.eth.abi.decodeParameter("uint256", await window.blockchainCall(element.dFO.methods.read, 'getVotesHardCap', '0x'));
        } catch (e) {}
        element.ens = element.ens || '';
        element.ensComplete = element.ens + '.dfohub.eth';
        element.ensComplete.indexOf('.') === 0 && (element.ensComplete = element.ensComplete.substring(1));
        try {
            view && view && setTimeout(function() {
                view && view.forceUpdate();
            });
        } catch (e) {}
    }, 300);
    return element;
};

window.refreshBalances = async function refreshBalances(view, element, silent) {
    if (!element) {
        return;
    }
    var ethereumPrice = await window.getEthereumPrice();
    element.balanceOf = await window.blockchainCall(element.token.methods.balanceOf, window.dfoHub.walletAddress);
    element.communityTokens = await window.blockchainCall(element.token.methods.balanceOf, element.walletAddress);
    element.communityTokensDollar = '0';
    element.singleCommunityTokenDollar = '0';
    element.availableSupply = window.web3.utils.toBN(element.totalSupply).sub(window.web3.utils.toBN(element.communityTokens)).toString();
    element.unlockedMarketCapDollar = 0;
    element.walletETH = await window.web3.eth.getBalance(element.walletAddress);
    element.walletETHDollar = ethereumPrice;
    element.walletBUIDL = await window.blockchainCall(window.dfoHub.token.methods.balanceOf, element.walletAddress);
    element.walletBUIDLDollar = '0';
    element.walletUSDC = '0';
    element.walletUSDCDollar = '0';
    element.walletDAI = '0';
    element.walletDAIDollar = '0';
    try {
        element.walletDAI = await window.blockchainCall(window.newContract(window.context.IERC20ABI, window.getNetworkElement("daiTokenAddress")).methods.balanceOf, element.walletAddress);
        element.walletDAIDollar = window.fromDecimals((await window.blockchainCall(window.uniswapV2Router.methods.getAmountsOut, window.toDecimals('1', 18), [window.getNetworkElement("daiTokenAddress"), window.wethAddress]))[1], 18, true);
        element.walletDAIDollar = parseFloat(window.fromDecimals(element.walletDAI, 18, true)) * parseFloat(element.walletDAIDollar) * ethereumPrice;
    } catch (e) {}
    try {
        element.communityTokensDollar = window.fromDecimals((await window.blockchainCall(window.uniswapV2Router.methods.getAmountsOut, window.toDecimals('1', element.decimals), [element.token.options.address, window.wethAddress]))[1], 18, true);
        element.singleCommunityTokenDollar = element.communityTokensDollar;
        element.communityTokensDollar = parseFloat(window.fromDecimals(element.communityTokens, 18, true)) * element.communityTokensDollar * ethereumPrice;
        element.walletUSDC = await window.blockchainCall(window.newContract(window.context.IERC20ABI, window.getNetworkElement("usdcTokenAddress")).methods.balanceOf, element.walletAddress);
        element.walletUSDCDollar = window.fromDecimals((await window.blockchainCall(window.uniswapV2Router.methods.getAmountsOut, window.toDecimals('1', 6), [window.getNetworkElement("usdcTokenAddress"), window.wethAddress]))[1], 18, true);
        element.walletUSDCDollar = parseFloat(window.fromDecimals(element.walletUSDC, 6, true)) * parseFloat(element.walletUSDCDollar) * ethereumPrice;
    } catch (e) {}
    try {
        element.walletBUIDLDollar = window.fromDecimals((await window.blockchainCall(window.uniswapV2Router.methods.getAmountsOut, window.toDecimals('1', window.dfoHub.decimals), [window.dfoHub.token.options.address, window.wethAddress]))[1], 18, true);
        element.walletBUIDLDollar = parseFloat(window.fromDecimals(element.walletBUIDL, 18, true)) * element.walletBUIDLDollar * ethereumPrice;
    } catch (e) {}
    element.walletCumulativeDollar = element.communityTokensDollar + element.walletETHDollar + element.walletUSDCDollar;
    element !== window.dfoHub && (element.walletCumulativeDollar += element.walletBUIDLDollar);
    element.walletCumulativeDollar && (element.walletCumulativeDollar = window.formatMoney(element.walletCumulativeDollar));
    element.walletUSDCDollar && (element.walletUSDCDollar = window.formatMoney(element.walletUSDCDollar));
    element.communityTokensDollar && (element.communityTokensDollar = window.formatMoney(element.communityTokensDollar));
    try {
        element.unlockedMarketCapDollar = parseFloat(element.singleCommunityTokenDollar.split(',').join('.')) * parseFloat(window.fromDecimals(element.availableSupply, element.decimals, true));
    } catch(e) {
    }
    try {
        element.lockedMarketCapDollar = parseFloat(element.singleCommunityTokenDollar.split(',').join('.')) * parseFloat(window.fromDecimals(element.communityTokens, element.decimals, true));
    } catch(e) {
    }
    try {
        element.totalMarketCapDollar = parseFloat(element.singleCommunityTokenDollar.split(',').join('.')) * parseFloat(window.fromDecimals(element.totalSupply, element.decimals, true));
    } catch(e) {
    }
    element.walletETHDollar && (element.walletETHDollar = window.formatMoney(element.walletETHDollar));
    element.walletBUIDLDollar && (element.walletBUIDLDollar = window.formatMoney(element.walletBUIDLDollar));
    element.walletDAIDollar && (element.walletDAIDollar = window.formatMoney(element.walletDAIDollar));
    element.myBalanceOf = window.walletAddress ? await window.blockchainCall(element.token.methods.balanceOf, window.walletAddress) : '0';
    view && view.forceUpdate();
    if (silent === true) {
        return;
    }
    setTimeout(function() {
        Promise.all(Object.keys(window.list).map(async function(key, i) {
            if (element.key === key) {
                return;
            }
            var e = window.list[key];
            if (!e.token) {
                return;
            }
            e.myBalanceOf = window.walletAddress ? await window.blockchainCall(e.token.methods.balanceOf, window.walletAddress) : '0';
        })).then(() => view && view.forceUpdate());
    });
};

window.getFIBlock = async function getFIBlock(element) {
    if (!element) {
        window.getFIBlock(window.dfoHub);
        return window.getFIBlock(window.list['10417092_log_61829c8c']);
    }
    var lastSwapBlock = parseInt(await window.blockchainCall(element.stateHolder.methods.getUint256, 'lastSwapBlock'));
    var swapBlockLimit = parseInt(await window.blockchainCall(element.stateHolder.methods.getUint256, 'swapBlockLimit'));
    console.log(element.name, window.getNetworkElement('etherscanURL') + 'block/countdown/' + (lastSwapBlock + swapBlockLimit));
};

window.uploadToIPFS = async function uploadToIPFS(files) {
    var single = !(files instanceof Array) && (!(files instanceof FileList) || files.length === 0);
    files = single ? [files] : files;
    var list = [];
    for (var i = 0; i < files.length; i++) {
        var file = files.item ? files.item(i) : files[i];
        if (!(file instanceof File) && !(file instanceof Blob)) {
            file = new Blob([JSON.stringify(file, null, 4)], { type: "application/json" });
        }
        list.push(file);
    }
    var hashes = [];
    window.api = window.api || new IpfsHttpClient(window.context.ipfsHost);
    for await (var upload of window.api.add(list)) {
        hashes.push(window.context.ipfsUrlTemplates[0] + upload.path);
    }
    return single ? hashes[0] : hashes;
};

window.validateDFOMetadata = async function validateDFOMetadata(metadata, noUpload) {
    var errors = [];
    !metadata && errors.push('Please provide data');

    metadata && metadata.brandUri && (!metadata.brandUri || !new RegExp(window.urlRegex).test(metadata.brandUri) || metadata.brandUri.indexOf('ipfs') === -1) && errors.push("DFO Logo is not a valid IPFS URL (ipfs://ipfs/...)");
    metadata && metadata.logoUri && (!metadata.logoUri || !new RegExp(window.urlRegex).test(metadata.logoUri) || metadata.logoUri.indexOf('ipfs') === -1) && errors.push("Token Logo is not a valid IPFS URL (ipfs://ipfs/...)");
    metadata && metadata.externalENS && (!metadata.externalENS || !new RegExp(window.urlRegex).test(metadata.externalENS) || metadata.externalENS.indexOf('.eth') === -1) && errors.push("External ENS link must contain a valid ENS URL");

    if (errors.length > 0) {
        throw errors.join('\n');
    }

    try {
        metadata.brandUri = metadata.brandUri.item(0);
    } catch (e) {}
    if (metadata && typeof metadata.brandUri !== 'string' && !await window.checkCoverSize(metadata.brandUri)) {
        //errors.push('Brand Logo must be valid 320x320 image');
    }
    try {
        metadata && (metadata.brandUri = (!metadata.brandUri || noUpload) ? metadata.brandUri : (typeof metadata.brandUri === 'string' && metadata.brandUri.indexOf('ipfs') !== -1) ? metadata.brandUri : await window.uploadToIPFS(metadata.brandUri));
    } catch (e) {
        errors.push(e.message || e);
    }
    try {
        metadata.logoUri = metadata.logoUri.item(0);
    } catch (e) {}
    if (metadata && typeof metadata.logoUri !== 'string' && !await window.checkCoverSize(metadata.logoUri)) {
        //errors.push('Token Logo must be valid 320x320 image');
    }
    try {
        metadata && (metadata.logoUri = (!metadata.logoUri || noUpload) ? metadata.logoUri : (typeof metadata.logoUri === 'string' && metadata.logoUri.indexOf('ipfs') !== -1) ? metadata.logoUri : await window.uploadToIPFS(metadata.logoUri));
    } catch (e) {
        //errors.push(e.message || e);
    }
    //metadata && !metadata.name && errors.push("Name is mandatory in metadata");
    //metadata && !metadata.shortDescription && errors.push("BIO is mandatory in metadata");
    //metadata && (!metadata.wpUri || !new RegExp(window.urlRegex).test(metadata.wpUri)) && errors.push("Explainer link must contain a valid URL");
    //metadata && !noUpload && (!metadata.brandUri || !new RegExp(window.urlRegex).test(metadata.brandUri) || metadata.brandUri.indexOf('ipfs') === -1) && errors.push("DFO Logo is not a valid URL");
    //metadata && !noUpload && (!metadata.logoUri || !new RegExp(window.urlRegex).test(metadata.logoUri) || metadata.logoUri.indexOf('ipfs') === -1) && errors.push("Token Logo is not a valid URL");
    //metadata && noUpload && !metadata.brandUri && errors.push("Insert a valid DFO Logo");
    //metadata && noUpload && !metadata.logoUri && errors.push("Insert a valid Token Logo image");
    //metadata && (!metadata.discussionUri || !new RegExp(window.urlRegex).test(metadata.discussionUri)) && errors.push("Chat link must contain a valid URL");
    //metadata && (!metadata.repoUri || !new RegExp(window.urlRegex).test(metadata.repoUri)) && errors.push("Repo link must contain a valid URL");
    //metadata && (!metadata.externalDNS || !new RegExp(window.urlRegex).test(metadata.externalDNS)) && errors.push("External link must contain a valid URL");
    //metadata && (!metadata.externalENS || !new RegExp(window.urlRegex).test(metadata.externalENS) || metadata.externalENS.indexOf('.eth') === -1) && errors.push("External ENS link must contain a valid ENS URL");
    //metadata && (!metadata.roadmapUri || !new RegExp(window.urlRegex).test(metadata.roadmapUri)) && errors.push("Roadmap link must contain a valid URL");
    if (errors.length > 0) {
        throw errors.join('\n');
    }
    return noUpload ? metadata : await window.uploadToIPFS(metadata);
};

window.proposeNewMetadataLink = async function proposeNewMetadataLink(element, metadata, noValidation) {
    var metadataLink = !noValidation ? await window.validateDFOMetadata(metadata) : null;
    var originalMetadataLink = null;
    try {
        originalMetadataLink = await window.blockchainCall(element.dFO.methods.read, 'getMetadataLink', '0x');
        originalMetadataLink = window.web3.eth.abi.decodeParameter('string', originalMetadataLink);
    } catch (e) {}
    if (originalMetadataLink === metadataLink) {
        return;
    }
    var descriptions = ['DFO Hub - Utilities - Get Metadata Link', 'The metadata located at this link contains all info about the DFO like name, short description, discussion link and many other info.'];
    var updates = !metadataLink ? ['Clearing Votes Hard Cap'] : ['Setting metadata link to ' + metadataLink];
    originalMetadataLink && descriptions.push(updates[0]);
    var template = !metadataLink ? undefined : JSON.parse(JSON.stringify(window.context.simpleValueProposalTemplate).split('type').join('string memory').split('value').join('\\"' + metadataLink + '\\"'));
    window.sendGeneratedProposal(element, {
        title: updates[0],
        functionalityName: metadataLink ? 'getMetadataLink' : '',
        functionalityMethodSignature: metadataLink ? 'getValue()' : '',
        functionalitySubmitable: false,
        functionalityReplace: originalMetadataLink ? 'getMetadataLink' : '',
        functionalityOutputParameters: metadataLink ? '["string"]' : '',
    }, template, undefined, descriptions, updates);
};

window.deployMetadataLink = async function deployMetadata(metadata, functionalitiesManager) {
    if(metadata) {
        var aVar = false;
        Object.values(metadata).forEach(it => {
            if(it) {
                aVar = true;
            }
        });
        if(!aVar) {
            return;
        }
    }
    var metadataLink = await window.validateDFOMetadata(metadata);
    var code = `
pragma solidity ^0.7.1;

contract DeployMetadataLink {

    constructor(address mVDFunctionalitiesManagerAddress, address sourceLocation, uint256 sourceLocationId, string memory metadataLink) {
        IMVDFunctionalitiesManager functionalitiesManager = IMVDFunctionalitiesManager(mVDFunctionalitiesManagerAddress);
        functionalitiesManager.addFunctionality("getMetadataLink", sourceLocation, sourceLocationId, address(new GetStringValue(metadataLink)), false, "getValue()", '["string"]', false, false);
        selfdestruct(msg.sender);
    }
}

interface IMVDFunctionalitiesManager {
    function addFunctionality(string calldata codeName, address sourceLocation, uint256 sourceLocationId, address location, bool submitable, string calldata methodSignature, string calldata returnAbiParametersArray, bool isInternal, bool needsSender) external;
}

contract GetStringValue {

    string private _value;

    constructor(string memory value) public {
        _value = value;
    }

    function onStart(address, address) public {
    }

    function onStop(address) public {
    }

    function getValue() public view returns(string memory) {
        return _value;
    }
}
`.trim();
    var selectedSolidityVersion = 'soljson-v0.7.1+commit.f4a555be.js';
    var compiled = await window.SolidityUtilities.compile(code, selectedSolidityVersion, 200);
    var selectedContract = compiled['DeployMetadataLink'];
    var args = [
        selectedContract.abi,
        selectedContract.bytecode,
        functionalitiesManager,
        window.getNetworkElement('defaultOcelotTokenAddress'),
        window.getNetworkElement('deployMetadataLinkSourceLocationId'),
        metadataLink
    ];
    return await window.createContract.apply(window, args);
};

window.checkCoverSize = function checkCoverSize(cover, width, height) {
    cover = (cover.item && cover.item(0)) || cover;
    width = width || 320;
    height = height || width;
    return new Promise(function(ok) {
        var reader = new FileReader();
        reader.addEventListener("load", function() {
            var image = new Image();
            image.onload = function onload() {
                return ok(image.width === width && image.height === height);
            };
            image.src = (window.URL || window.webkitURL).createObjectURL(cover);
        }, false);
        reader.readAsDataURL(cover);
    });
};

window.formatLink = function formatLink(link) {
    link = (link ? link instanceof Array ? link[0] : link : '');
    if(link.indexOf('assets') === 0 || link.indexOf('/assets') === 0) {
        return link;
    }
    for(var temp of window.context.ipfsUrlTemplates) {
        link = link.split(temp).join(window.context.ipfsUrlChanger);
    }
    while(link && link.startsWith('/')) {
        link = link.substring(1);
    }
    return (!link ? '' : link.indexOf('http') === -1 ? ('https://' + link) : link).split('https:').join('').split('http:').join('');
};

window.generateFunctionalityMetadataLink = async function generateFunctionalityMetadataLink(data) {
    var comments = {};
    try {
        comments = window.extractComment(data.sourceCode || data.code);
    } catch (e) {}
    var codeName = data.codeName || data.functionalityName;
    var replaces = data.replaces || data.functionalityReplace;
    var metadata = {
        title: data.title,
        codeName,
        description: {
            Discussion: window.formatLink(comments.Discussion || data.element.ensComplete),
            Description: comments.Description,
            Update: comments.Update,
        },
        code: data.sourceCode || data.code,
        version: await window.getNextFunctionalityVersion(data, codeName, replaces)
    }
    return await window.uploadToIPFS(metadata);
};

window.getNextFunctionalityVersion = async function getNextFunctionalityVersion(data, codeName, replaces) {
    var version = 0;
    if (replaces && codeName) {
        try {
            var functionalityLocation = (await window.blockchainCall(data.element.functionalitiesManager.methods.getFunctionalityData, data.replaces))[0];
            var metadata = await window.AJAXRequest(await window.blockchainCall(window.newContract(window.context.IFunctionalityAbi, functionalityLocation).methods.getMetadataLink));
            version = 1 + metadata.version;
        } catch (e) {}
    }
    return version;
};

window.getHomepageLink = function getHomepageLink(tail) {
    var link = '';
    link += window.location.protocol;
    link += '//';
    link += window.location.hostname;
    window.location.port && (link += (':' + window.location.port));
    link += window.location.pathname;
    !link.endsWith('/') && (link += '/');
    return link + (tail || '');
};

window.setHomepageLink = function setHomepageLink(tail) {
    window.history.pushState({}, "", window.getHomepageLink(tail));
};

window.preventItem = function preventItem(e) {
    if(!e) {
        return;
    }
    e.preventDefault && e.preventDefault(true);
    e.stopPropagation && e.stopPropagation(true);
    return e;
};

window.sleep = function sleep(millis) {
    return new Promise(function(ok) {
        setTimeout(ok, millis);
    });
};

window.getTokenPriceInDollarsOnUniswap = async function getTokenPriceInDollarsOnUniswap(tokenAddress, decimals, amountPlain) {
    var ethereumPrice = await window.getEthereumPrice();
    var path = [
        tokenAddress,
        window.wethAddress
    ];
    var amount = window.toDecimals(window.numberToString(!isNaN(amountPlain) ? amountPlain : 1), decimals);
    var ethereumValue = "0";
    try {
        ethereumValue = (await window.blockchainCall(window.uniswapV2Router.methods.getAmountsOut, amount, path))[1];
    } catch(e) {
    }
    ethereumValue = parseFloat(window.fromDecimals(ethereumValue, decimals));
    ethereumValue *= ethereumPrice;
    return ethereumValue;
};