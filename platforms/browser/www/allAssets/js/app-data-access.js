var _moduleName_dataAccess = "app-data-access";
var _DBName = 'Database_ModularComposite.db';
var _TableName_Customer = 'Customer';
var _TableName_Quote = 'Quote';
var _DBConn = null;  //db connection to keep while app is open

//phonegap specific settings
var _DbPhoneGap = null;

//sql statements - used by PhoneGap, AIR
var _SQL_CustomerCreate =     
        "CREATE TABLE IF NOT EXISTS " + _TableName_Customer + " (" +
        "    CustomerId INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "    CustomerName TEXT, " +
        "    CustomerNumber TEXT, " +
        "    IsLocal INTEGER, " +
        "    Address TEXT, " +
        "    City TEXT, " +
        "    State TEXT, " +
        "    Zip TEXT, " +
        "    Country TEXT, " +
        "    MachineNumber TEXT, " +
        "    SectionCode TEXT, " +
        "    SectionName TEXT, " +
        "    ApplicationCode TEXT, " +
        "    ApplicationName TEXT, " +
        "    PaperGrade TEXT, " +
        "    ImperialMetric TEXT, " +
        "    CreateDate TEXT " +
        ")";
var _SQL_QuoteCreate =     
        "CREATE TABLE IF NOT EXISTS " + _TableName_Quote + " (" +
        "    QuoteId INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "    QuoteDate TEXT, " +
        "    PDFFileName TEXT, " +
        "    OriginalQuoteId TEXT, " +
        "    OriginalQuoteCaption TEXT, " +  //original quoteId + customer number
        "    CustomerJSON TEXT, " +
        "    ProductJSON TEXT, " +
        "    ProductSelectionJSON TEXT, " +
        "    AppTypeJSON TEXT " +
        ")";


//-----------------------------------------------------------------------------------
//      Init DB
//-----------------------------------------------------------------------------------
function appDataAccessInit() {
    if (IsEnvironmentAIR()) {
        InitDatabase_AIR();
    }
    else if (IsEnvironmentPHONEGAP()) {
        InitDatabase_PHONEGAP();
    }
    else { //dev - do nothing
    }
}


//-----------------------------------------------------------------------------------
//      Read Customers - custList is the existing customers, we will append to this array
//-----------------------------------------------------------------------------------
function DataAccess_CustomerRead(onSuccessCallbackFn) {
    if (IsEnvironmentAIR()) {
        return DataAccess_CustomerRead_AIR();
    }
    else if (IsEnvironmentPHONEGAP()) {
        return DataAccess_CustomerRead_PHONEGAP(onSuccessCallbackFn);
    }
    else {
        //dev - create 5 mock customer records to load on start up
        var resultData = [];
        for (i = 0; i < 5; i++) {
            var row = {};
            var custDisplayNum = ((i + 12) * 6).toString();
            row.CustomerId = i;
            row.CustomerNumber = '[LOCAL]-' + (i + 1).toString();
            row.CreateDate = (new Date()).toLocaleDateString();
            row.IsLocal = true;
            row.Name = custDisplayNum + ' TEST';
            row.Address = custDisplayNum + ' Main St.';
            row.City = 'Atlanta';
            row.State = 'GA';
            row.Zip = '30303';
            row.Country = 'US';
            row.MachineNumber = '027';
            row.SectionName = 'Calendar';
            row.SectionCode = '027';
            row.ApplicationName = 'Soft nip';
            row.ApplicationCode = '[LOCAL]';
            row.PaperGrade = 'TEST-Stock';
            row.ImperialMetric = 'M';
            resultData.push(row);
        }
		if (onSuccessCallbackFn == undefined)
		{
			return resultData;
		}
		else 
		{
			onSuccessCallbackFn(resultData);
		}
    }
}

//-----------------------------------------------------------------------------------
//      Create Customer - call envrionment specific area, return the PK of the new row
//-----------------------------------------------------------------------------------
function DataAccess_CustomerCreate(jsonCust) {
    if (IsEnvironmentAIR()) {
        return DataAccess_CustomerCreate_AIR(jsonCust);
    }
    else if (IsEnvironmentPHONEGAP()) {
        return DataAccess_CustomerCreate_PHONEGAP(jsonCust);
    }
    else {
        //dev - do nothing
        return jsonCust.CustomerId;
    }
}

//-----------------------------------------------------------------------------------
//      Read quotes 
//-----------------------------------------------------------------------------------
function DataAccess_QuoteRead(onSuccessCallbackFn) {
    if (IsEnvironmentAIR()) {
        return DataAccess_QuoteRead_AIR(null);
    }
    else if (IsEnvironmentPHONEGAP()) {
        return DataAccess_QuoteRead_PHONEGAP(null,onSuccessCallbackFn);
    }
    else {
        //DEV scenarios
        //if the quote history data is already populated, then use it
        if (_jsonQuoteHistoryData != undefined && _jsonQuoteHistoryData.length > 0) {
            return _jsonQuoteHistoryData;
        }

        var appTypes = AppType_Get();

        var resultData = [];
        //add a real quote in there
        var qSample = '{"QuoteId":47,"QuoteDate":"Tuesday, June 07, 2016","PDFFileName":"1465305002106.pdf","OriginalQuoteId":null,"OriginalQuoteCaption":null,"Customer":{"CustomerId":"185113","CustomerNumber":"185113","CreateDate":"","IsLocal":false,"Name":"Leipa Georg Leinfelder GmbH - Schwedt","Address":"Kuhheide 34","City":"Schwedt","State":"??","Zip":"16303","Country":"DE","MachineNumber":"003","SectionName":"calendar","SectionCode":"005","ApplicationName":"Soft nip calender - elastic ro","ApplicationCode":"SNKEW","PaperGrade":"Packaging - Liner","ImperialMetric":"M"},"ProductSelection":{"CoreDiameter":"9.17","FinishDiameter":"9.17","CoverLength":"9.17","ProductName":"NanoPearl S 92","Temperature":"80","Speed":"425","LineLoadUOM":"kN/m","TemperatureUOM":"c","SpeedUOM":"m/min","CoreDiameterUOM":"","FinishDiameterUOM":"","CoverLengthUOM":"","LineLoad":"75","RankExisting":false,"ImagesConcatenated":"base:Base001.png|3:Barring_p008.png|4:Impact_p007.png|5:Gloss_p006.png"},"Product":{"SectionName":"Calendar","ProductLine":"Rolls","Supplier":"","ModuleName":"M11","ProductName":"NanoPearl S 92","ApplicationCode":"SN","RankExisting":false,"StandardConfiguration":true,"AppType":[{"AppTypeId":2,"AppTypeId_FK":1,"Sequence":1,"Caption":"Abrasion","ShowInList":true,"IconName_LightGray":"allAssets/img/attribute_icons/Abrasion_001.png","IconName_DarkGray":"allAssets/img/attribute_icons/Abrasion_003.png","IconName_Blue":"allAssets/img/attribute_icons/Abrasion_002.png","Rank":"9","BaseImage":"000_Base.png","LayerImage":"Abrasion_p009.png","Benefit":"Excellent - Due to the engineered combination of high-end Nano Particles in combination with the resin formulation provides this cover an Top Notch Abrasion resistance."},{"AppTypeId":3,"AppTypeId_FK":2,"Sequence":2,"Caption":"Barring Resistance","ShowInList":true,"IconName_LightGray":"allAssets/img/attribute_icons/Barring_001.png","IconName_DarkGray":"allAssets/img/attribute_icons/Barring_003.png","IconName_Blue":"allAssets/img/attribute_icons/Barring_002.png","Rank":"8","BaseImage":"Base001.png","LayerImage":"Barring_p008.png","Benefit":"Outstanding - The selection of engineered components offers barring resistance for a wider operating window  without barring."},{"AppTypeId":4,"AppTypeId_FK":3,"Sequence":3,"Caption":"Impact Resistance","ShowInList":true,"IconName_LightGray":"allAssets/img/attribute_icons/Impact_001.png","IconName_DarkGray":"allAssets/img/attribute_icons/Impact_003.png","IconName_Blue":"allAssets/img/attribute_icons/Impact_002.png","Rank":"7","BaseImage":"","LayerImage":"Impact_p007.png","Benefit":"Over Average - With the impact resistance over average the the medium demanding positions concerning impacts."},{"AppTypeId":5,"AppTypeId_FK":4,"Sequence":4,"Caption":"High Gloss","ShowInList":true,"IconName_LightGray":"allAssets/img/attribute_icons/Gloss_001.png","IconName_DarkGray":"allAssets/img/attribute_icons/Gloss_003.png","IconName_Blue":"allAssets/img/attribute_icons/Gloss_002.png","Rank":"6","BaseImage":"","LayerImage":"Gloss_p006.png","Benefit":"High - For applications where Gloss is important but not the most important key success factor."},{"AppTypeId":6,"AppTypeId_FK":5,"Sequence":5,"Caption":"Anti Static","ShowInList":false,"IconName_LightGray":"allAssets/img/attribute_icons/Antistatic_001.png","IconName_DarkGray":"allAssets/img/attribute_icons/Antistatic_003.png","IconName_Blue":"allAssets/img/attribute_icons/Antistatic_002.png","Rank":"0","BaseImage":"","LayerImage":"","Benefit":""},{"AppTypeId":7,"AppTypeId_FK":6,"Sequence":6,"Caption":"Anti Sticky","ShowInList":false,"IconName_LightGray":"allAssets/img/attribute_icons/Antisticky_001.png","IconName_DarkGray":"allAssets/img/attribute_icons/Antisticky_003.png","IconName_Blue":"allAssets/img/attribute_icons/Antisticky_002.png","Rank":"0","BaseImage":"","LayerImage":"","Benefit":""},{"AppTypeId":8,"AppTypeId_FK":7,"Sequence":7,"Caption":"Repairability","ShowInList":false,"IconName_LightGray":"allAssets/img/attribute_icons/Repair_001.png","IconName_DarkGray":"allAssets/img/attribute_icons/Repair_002.png","IconName_Blue":"allAssets/img/attribute_icons/Repair_002.png","Rank":"10","BaseImage":"","LayerImage":"","Benefit":"Offers the possibility to get eighter a local spot repair or a ring repair in case the cover is damaged locally."}],"AppTypeRankConcatenated":"2:9|3:8|4:7|5:6|6:0|7:0|8:10","ImagesConcatenated":"base:Base001.png|3:Barring_p008.png|4:Impact_p007.png|5:Gloss_p006.png"},"AppType":[{"AppTypeId":2,"AppTypeId_FK":1,"Sequence":1,"Caption":"Abrasion","ShowInList":true,"Rank":"9","OriginalRank":"9","Benefit":"Excellent - Due to the engineered combination of high-end Nano Particles in combination with the resin formulation provides this cover an Top Notch Abrasion resistance.","LayeredImageNamingConvention":"Abrasion_p0%%RANK%%.png"},{"AppTypeId":3,"AppTypeId_FK":2,"Sequence":2,"Caption":"Barring Resistance","ShowInList":true,"Rank":"8","OriginalRank":"8","Benefit":"Outstanding - The selection of engineered components offers barring resistance for a wider operating window  without barring.","LayeredImageNamingConvention":"Barring_p0%%RANK%%.png"},{"AppTypeId":4,"AppTypeId_FK":3,"Sequence":3,"Caption":"Impact Resistance","ShowInList":true,"Rank":"7","OriginalRank":"7","Benefit":"Over Average - With the impact resistance over average the the medium demanding positions concerning impacts.","LayeredImageNamingConvention":"Impact_p0%%RANK%%.png"},{"AppTypeId":5,"AppTypeId_FK":4,"Sequence":4,"Caption":"High Gloss","ShowInList":true,"Rank":"6","OriginalRank":"6","Benefit":"High - For applications where Gloss is important but not the most important key success factor.","LayeredImageNamingConvention":"Gloss_p0%%RANK%%.png"},{"AppTypeId":6,"AppTypeId_FK":5,"Sequence":5,"Caption":"Anti Static","ShowInList":false,"Rank":"0","OriginalRank":"0","Benefit":"","LayeredImageNamingConvention":""},{"AppTypeId":7,"AppTypeId_FK":6,"Sequence":6,"Caption":"Anti Sticky","ShowInList":false,"Rank":"0","OriginalRank":"0","Benefit":"","LayeredImageNamingConvention":""},{"AppTypeId":8,"AppTypeId_FK":7,"Sequence":7,"Caption":"Repairability","ShowInList":false,"Rank":"10","OriginalRank":"10","Benefit":"Offers the possibility to get eighter a local spot repair or a ring repair in case the cover is damaged locally.","LayeredImageNamingConvention":""}]}';
        resultData.push($.parseJSON(qSample));

        //dev - create 5 mock customer records to load on start up of app
        var customerList = DataAccess_CustomerRead();
        for (j = 0; j < 5; j++) {
            row = {};
            row.QuoteId = 5 - j;
            row.PDFFileName = 'TestQuoteFile-' + j.toString() + '.pdf';
            row.QuoteDate = (new Date()).toLocaleDateString();
            row.Customer = customerList[j];  //pull this from mocked up customer data

            //page 1 js - data
            var productSelection = {};
            productSelection.CoreDiameter = '10';
            productSelection.FinishDiameter = '10';
            productSelection.CoverLength = '10';
            productSelection.ProductName = 'TEST';
            productSelection.LineLoad = (75 + j * 2).toString();
            productSelection.Temperature = (90 - j).toString();
            productSelection.Speed = (298 - j * 3).toString();
            productSelection.LineLoadUOM = 'kN/m';
            productSelection.TemperatureUOM = 'c';
            productSelection.SpeedUOM = 'm/min';
            productSelection.CoreDiameterUOM = '';
            productSelection.FinishDiameterUOM = '';
            productSelection.CoverLengthUOM = '';
            row.ProductSelection = productSelection;

            //application type data - prod selection screen
            row.Product = {};
            row.Product.ProductName = 'TEST ' + j.toString();
            row.Product.ModuleName = 'M' + j.toString();
            row.Product.ImagesConcatenated = "base:000_005_NeoTop_S.png|3:Barring_p006.png|4:Impact_p006.png|5:Gloss_p005.png";
            row.AppType = [];
            $.each(appTypes, function (i, item) {
                var appType = {};
                appType.AppTypeId = item.AppTypeId;
                appType.AppTypeId_FK = item.AppTypeId_FK;
                appType.Sequence = item.Sequence;
                appType.Caption = item.Caption;
                appType.Rank = 0;
                if (item.ShowInList) { appType.Rank = i + 2; }
                else if (item.AppTypeId > 5) { appType.Rank = 10; }
                appType.Benefit = (item.ShowInList ? 'Test Quote Benefit for ' + appType.Caption : '');
                row.AppType.push(appType);
            });
            resultData.push(row);
        }
		if (onSuccessCallbackFn == undefined)
		{
			return resultData;
		}
		else 
		{
			onSuccessCallbackFn(resultData);
		}
    }
}

//-----------------------------------------------------------------------------------
//      Read quotes 
//-----------------------------------------------------------------------------------
function DataAccess_QuoteSearch(term) {
    if (term != undefined) {
        term = term.toLowerCase();
    }

    if (IsEnvironmentAIR()) {
        return DataAccess_QuoteRead_AIR(term);
    }
    else if (IsEnvironmentPHONEGAP()) {
        return DataAccess_QuoteRead_PHONEGAP(null);
    }
    else {
        var quoteHistoryData = QuoteHistory_Get();
        var result = [];
        //loop over in memory copy and filter against search term on several fields 
        $.each(quoteHistoryData, function (i, quote) {
            if (quote.Customer.Name.toLowerCase().indexOf(term) != -1 ||
                //quote.Customer.CustomerNumber.toLowerCase() == term ||  //TBD - this is integer
                quote.Customer.MachineNumber.toLowerCase().indexOf(term) != -1 ||
                quote.Customer.SectionName.toLowerCase().indexOf(term) != -1 ||
                quote.Customer.PaperGrade.toLowerCase().indexOf(term) != -1) {
                result.push(quote);
            }
        });
        return result;
    }
}

//-----------------------------------------------------------------------------------
//      Create Quote - call envrionment specific area, return the PK of the new row
//-----------------------------------------------------------------------------------
function DataAccess_QuoteCreate(jsonQuote) {
    if (IsEnvironmentAIR()) {
        return DataAccess_QuoteCreate_AIR(jsonQuote);
    }
    else if (IsEnvironmentPHONEGAP()) {
        return DataAccess_QuoteCreate_PHONEGAP(jsonQuote);
    }
    else {
        //dev - do nothing
        return jsonQuote.QuoteId;
    }
}

//-----------------------------------------------------------------------------------
//      Init connection
//-----------------------------------------------------------------------------------
function Connection_Air() {
    if (_DBConn == undefined) {
        // The database file is in the application storage directory 
        var folder = air.File.applicationStorageDirectory;
        var dbFile = folder.resolvePath(_DBName);
        _DBConn = new air.SQLConnection();
        _DBConn.open(dbFile);
        LogMessage(_moduleName_dataAccess + ": Init DB - database connection established");
    }
    return _DBConn;
}

//-----------------------------------------------------------------------------------
//      Init DB - AIR - Create AIR tables
//-----------------------------------------------------------------------------------
function InitDatabase_AIR() {

    var conn = Connection_Air();

    //TBD - temp for dev. Uncomment when we need to adjust the table columns
    //DropTable_AIR(conn, _TableName_Customer);
    //DropTable_AIR(conn, _TableName_Quote);

    //create tables if not exist
    //customer
    CreateTable_AIR(conn, _SQL_CustomerCreate, _TableName_Customer);
    //add imperial metric
    AlterTable_AIR(conn, _TableName_Customer, 'ImperialMetric', 'TEXT');

    //quote
    CreateTable_AIR(conn, _SQL_QuoteCreate, _TableName_Quote);
}

function CreateTable_AIR(conn, sql, tableName) {
    //create tables if not exist
    var sqlCreate = new air.SQLStatement();
    sqlCreate.sqlConnection = conn;
    sqlCreate.text = sql;
    sqlCreate.execute();
    LogMessage(_moduleName_dataAccess + ": Create table - " + tableName + " completed successfully");
}


function AlterTable_AIR(conn, tableName, colName, colType) {
    conn.loadSchema();
    var tables = conn.getSchemaResult().tables;
    var colExists = false;
    $.each(tables, function (i, tbl) {
        if (tbl.name == tableName) {
            if (tbl.sql.indexOf(' ' + colName + ' ') > -1) {
                LogMessage(_moduleName_dataAccess + ": Alter table - " + tableName + " column " + colName + ' already exists. No need to add column');
                colExists = true;
                return;
            }
        }
    });
    if (colExists) { return; }

    //check if col exists - this won't work in AIR. They block access to sqllite_mater
    //sql.text = "SELECT name FROM sqlite_master WHERE type='table' AND tbl_name = '"+ tableName +"' ORDER BY name";
    //sql.text = "PRAGMA table_info('" + tableName + "')";
    //sql.execute();
    //get result set and return to calling code

    //add column - if we get here, the col is not there
    var sql = new air.SQLStatement();
    sql.sqlConnection = conn;
    sql.text = 'ALTER TABLE ' + tableName + ' ADD COLUMN ' + colName + ' ' + colType;
    //LogMessage(_moduleName_dataAccess + ": Alter table - sql: " + sql.text);
    sql.execute();
    LogMessage(_moduleName_dataAccess + ": Alter table - " + tableName + " column " + colName + " column added");
}


//-----------------------------------------------------------------------------------
//      AIR - Drop - Phone Gap
//-----------------------------------------------------------------------------------
function DropTable_AIR(conn, tableName) {
    try {
        var dropStmt = new air.SQLStatement();
        dropStmt.sqlConnection = conn;
        dropStmt.text = "DROP TABLE IF EXISTS " + tableName;
        dropStmt.execute();
        LogMessage(_moduleName_dataAccess + ": Drop Table " + tableName + " completed");
    }
    catch (error) {
        LogMessage(_moduleName_dataAccess + ": Drop Table " + tableName + " - " + error.message + '...Details: ' + error.details);
    }
}


//-----------------------------------------------------------------------------------
//      AIR - CUSTOMER - data access
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
//      READ local customers data - AIR
//-----------------------------------------------------------------------------------
function DataAccess_CustomerRead_AIR() {
    try {
        resultData = [];
        var sqlStm = new air.SQLStatement();
        sqlStm.sqlConnection = Connection_Air();
        sqlStm.text = 'SELECT * FROM ' + _TableName_Customer;
        sqlStm.execute();
        //get result set and return to calling code
        var result = sqlStm.getResult();
        //if nothing in table, then account for this
        var numResults = 0;
        if (result.data != undefined) {
            numResults = result.data.length;
        }
        for (i = 0; i < numResults; i++) {
            var row = result.data[i];
            row.IsLocal = (row.IsLocal == 1);  //convert to bool 
            row.CustomerNumber = (row.IsLocal == 1 ? '[LOCAL]-' + row.CustomerId.toString() : row.CustomerNumber);
            row.Name = row.CustomerName;
            var output = "CustomerId: " + row.CustomerId;
            output += "; Name: " + row.Name;
            LogMessage(_moduleName_dataAccess + ": Read " + _TableName_Customer + " - " + output);
            //transfer data to customer list
            resultData.push(row);
        }
        LogMessage(_moduleName_dataAccess + ": Read " + _TableName_Customer + " - " + numResults + " row(s) returned");
        return resultData;
    }
    catch (error) {
        LogMessage(_moduleName_dataAccess + ": Read " + _TableName_Customer + " Error - " + error.message + '...Details: ' + error.details);
    }
}

//-----------------------------------------------------------------------------------
//      CREATE local customers data - AIR
//-----------------------------------------------------------------------------------
function DataAccess_CustomerCreate_AIR(customer) {

    try {
        var sql = 'INSERT INTO %%TABLENAME%% (%%COLUMNS%%) VALUES (%%VALUES%%) ';
        var columns =
		    'CustomerNumber' +
            ',IsLocal' +
            ',CustomerName' +
            ',Address' +
            ',City' +
            ',State' +
            ',Zip' +
            ',Country' +
            ',MachineNumber' +
            ',SectionCode' +
            ',SectionName' +
            ',ApplicationCode' +
            ',ApplicationName' +
            ',PaperGrade' +
            ',ImperialMetric' +
            ',CreateDate ';
        var values =
        ':CustomerNumber' +
        ',:IsLocal' +
        ',:CustomerName' +
        ',:Address' +
        ',:City' +
        ',:State' +
        ',:Zip' +
        ',:Country' +
        ',:MachineNumber' +
        ',:SectionCode' +
        ',:SectionName' +
        ',:ApplicationCode' +
        ',:ApplicationName' +
        ',:PaperGrade' +
        ',:ImperialMetric' +
        ',:CreateDate ';
        sql = sql.replace('%%TABLENAME%%', _TableName_Customer);
        sql = sql.replace('%%COLUMNS%%', columns);
        sql = sql.replace('%%VALUES%%', values);
        //LogMessage(_moduleName_dataAccess + ": Insert SQL: " + sql);
        var sqlStm = new air.SQLStatement();
        sqlStm.text = sql;
        sqlStm.parameters[":CustomerNumber"] = customer.CustomerNumber;
        sqlStm.parameters[":IsLocal"] = '1';
        sqlStm.parameters[":CustomerName"] = customer.Name;
        sqlStm.parameters[":Address"] = customer.Address;
        sqlStm.parameters[":City"] = customer.City;
        sqlStm.parameters[":State"] = customer.State;
        sqlStm.parameters[":Zip"] = customer.Zip;
        sqlStm.parameters[":Country"] = customer.Country;
        sqlStm.parameters[":MachineNumber"] = customer.MachineNumber;
        sqlStm.parameters[":SectionCode"] = customer.SectionCode;
        sqlStm.parameters[":SectionName"] = customer.SectionName;
        sqlStm.parameters[":ApplicationCode"] = customer.ApplicationCode;
        sqlStm.parameters[":ApplicationName"] = customer.ApplicationName;
        sqlStm.parameters[":PaperGrade"] = customer.PaperGrade;
        sqlStm.parameters[":ImperialMetric"] = customer.ImperialMetric;
        sqlStm.parameters[":CreateDate"] = (new Date()).toLocaleDateString();

        sqlStm.sqlConnection = Connection_Air();
        sqlStm.execute();
        var result = sqlStm.getResult();
        var primaryKey = result.lastInsertRowID;
        LogMessage(_moduleName_dataAccess + ": Insert " + _TableName_Customer + " - " + customer.Name + " one row inserted, id = " + primaryKey);
        return primaryKey;
    }
    catch (error) {
        LogMessage(_moduleName_dataAccess + ": Insert " + _TableName_Customer + " Error - " + error.message + '...Details: ' + error.details);
    }
}

//-----------------------------------------------------------------------------------
//      UPDATE local customers data - AIR
//-----------------------------------------------------------------------------------
function DataAccess_CustomerUpdate_AIR(customer) {
    //not implemented
}

//-----------------------------------------------------------------------------------
//      DELETE local customers data - AIR
//-----------------------------------------------------------------------------------
function DataAccess_CustomerDelete_AIR(customerId) {
    //not implemented
}

//-----------------------------------------------------------------------------------
//      AIR - QUOTE - data access
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
//      READ local QuoteHistorys data - AIR
//-----------------------------------------------------------------------------------
function DataAccess_QuoteRead_AIR(term) {
    try {
        resultData = [];
        var sql = 'SELECT * FROM ' + _TableName_Quote;
        //optional filter
        if (term != undefined && term.length > 0) {
            //revisit this - may have to break out some fields in order to search
            sql += ' WHERE LOWER(CustomerJSON) like "%' + term + '%"';
        }
        //add order by
        sql += ' ORDER BY QuoteId desc';
        var sqlStm = new air.SQLStatement();
        sqlStm.sqlConnection = Connection_Air();
        sqlStm.text = sql;
        sqlStm.execute();
        //get result set and return to calling code
        var result = sqlStm.getResult();
        //if nothing in table, then account for this
        var numResults = 0;
        if (result.data != undefined) {
            numResults = result.data.length;
        }
        for (i = 0; i < numResults; i++) {
            var row = result.data[i];
            //LogMessage(_moduleName_dataAccess + ": Read " + _TableName_Quote + " - QuoteId: " + row.QuoteId);
            //transfer data to QuoteHistory list
            resultData.push(TransferQuoteHistoryRowToJSON(row));
        }
        LogMessage(_moduleName_dataAccess + ": Read " + _TableName_Quote + " - " + numResults + " row(s) returned");
        return resultData;
    }
    catch (error) {
        LogMessage(_moduleName_dataAccess + ": Read " + _TableName_Quote + " Error - " + error.message + '...Details: ' + error.details);
    }
}

//-----------------------------------------------------------------------------------
//      CREATE local Quote data - AIR
//-----------------------------------------------------------------------------------
function DataAccess_QuoteCreate_AIR(quote) {

    try {
        var sql = 'INSERT INTO %%TABLENAME%% (%%COLUMNS%%) VALUES (%%VALUES%%) ';
        var columns =
            ' QuoteDate' +
            ',PDFFileName' +
            ',OriginalQuoteId' +
            ',OriginalQuoteCaption' +
            ',CustomerJSON' +
            ',ProductJSON' +
            ',ProductSelectionJSON' +
            ',AppTypeJSON';
        var values =
        ' :QuoteDate' +
        ',:PDFFileName' +
        ',:OriginalQuoteId' +
        ',:OriginalQuoteCaption' +
        ',:CustomerJSON' +
        ',:ProductJSON' +
        ',:ProductSelectionJSON' +
        ',:AppTypeJSON';
        sql = sql.replace('%%TABLENAME%%', _TableName_Quote);
        sql = sql.replace('%%COLUMNS%%', columns);
        sql = sql.replace('%%VALUES%%', values);
        //LogMessage(_moduleName_dataAccess + ": Insert SQL: " + sql);
        var sqlStm = new air.SQLStatement();
        sqlStm.text = sql;
        sqlStm.parameters[":QuoteDate"] = quote.QuoteDate;
        sqlStm.parameters[":PDFFileName"] = quote.PDFFileName;
        sqlStm.parameters[":OriginalQuoteId"] = quote.OriginalQuoteId;
        sqlStm.parameters[":OriginalQuoteCaption"] = quote.OriginalQuoteCaption;
        sqlStm.parameters[":CustomerJSON"] = JSON.stringify(quote.Customer);
        sqlStm.parameters[":ProductJSON"] = JSON.stringify(quote.Product);
        sqlStm.parameters[":ProductSelectionJSON"] = JSON.stringify(quote.ProductSelection);
        sqlStm.parameters[":AppTypeJSON"] = JSON.stringify(quote.AppType);
        sqlStm.sqlConnection = Connection_Air();
        sqlStm.execute();
        var result = sqlStm.getResult();
        var primaryKey = result.lastInsertRowID;
        LogMessage(_moduleName_dataAccess + ": Insert " + _TableName_Quote + " - one row inserted, id = " + primaryKey);
        return primaryKey;
    }
    catch (error) {
        LogMessage(_moduleName_dataAccess + ": Insert " + _TableName_Quote + " Error - " + error.message + '...Details: ' + error.details);
    }
}

//-----------------------------------------------------------------------------------
//      UPDATE local QuoteHistorys data - AIR
//-----------------------------------------------------------------------------------
function DataAccess_QuoteUpdate_AIR(quote) {
    //not implemented
}

//-----------------------------------------------------------------------------------
//      DELETE local QuoteHistorys data - AIR
//-----------------------------------------------------------------------------------
function DataAccess_QuoteDelete_AIR(quoteId) {
    //not implemented
}

//-----------------------------------------------------------------------------------
//      Phone Gap - DATABASE CODE
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
//      Init DB - Phone Gap
//-----------------------------------------------------------------------------------
function InitDatabase_PHONEGAP() {

    var db = OpenDatabase_PHONEGAP();

	//create tables if they do not exist
	db.transaction(function(tx){
		//TBD - temp for dev. Uncomment when we need to adjust the table columns
		//tx.executeSql('DROP TABLE ' + _TableName_Customer);
		//tx.executeSql('DROP TABLE ' + _TableName_Quote);
		//customer
		//tx.executeSql( _SQL_CustomerCreate,[],nullHandler,errorHandler);
		tx.executeSql( _SQL_CustomerCreate);
		LogMessage(_moduleName_dataAccess + ": Create table - " + _TableName_Customer + " completed successfully");
		//quote
		//tx.executeSql( _SQL_QuoteCreate,[],nullHandler,errorHandler);
		tx.executeSql( _SQL_QuoteCreate);
		LogMessage(_moduleName_dataAccess + ": Create table - " + _TableName_Quote + " completed successfully");
		//add imperial metric
		//AlterTable_PHONEGAP(tx, _TableName_Customer, 'ImperialMetric', 'TEXT');
	});
}

//-----------------------------------------------------------------------------------
//      OpenDatabase_PHONEGAP - open db, create if not exists, return db object 
//-----------------------------------------------------------------------------------
function OpenDatabase_PHONEGAP() {
	//use the existing db if already initialized
	if (_DbPhoneGap != undefined)
	{
		return _DbPhoneGap;
	}		
	
	if (!window.openDatabase) {
		// not all mobile devices support databases  if it does not, the
		//following alert will display
	   // indicating the device will not be albe to run this application
	   ShowMessage(_ApplicationName, 'Databases are not supported on this device. Contact your system administrator');
	   return null;
	 }

	// this line tries to open the database base locally on the device
	// if it does not exist, it will create it and return a database
	//object stored in variable db
	var version = '1.0';
	var maxSize = 65535;
	_DbPhoneGap = window.openDatabase(_DBName, version, _DBName, maxSize);  //shortName, version, displayName,maxSize
	return _DbPhoneGap;
}

//-----------------------------------------------------------------------------------
//      PHONEGAP - CUSTOMER data access
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
//      READ local customers data - PhoneGap
//-----------------------------------------------------------------------------------
function DataAccess_CustomerRead_PHONEGAP(onSuccessCallbackFn) {
	resultData = [];
	var db = OpenDatabase_PHONEGAP();
	var sql = 'SELECT * FROM ' + _TableName_Customer;

	var numResults = 0;
	db.transaction(function(tx) {
		tx.executeSql(sql, [], function (tx, result) {
			numResults = result.rows.length;
			for (i = 0; i < numResults; i++) {
				var row = result.rows.item(i);
				row.IsLocal = (row.IsLocal == 1);  //convert to bool 
				row.CustomerNumber = (row.IsLocal == 1 ? '[LOCAL]-' + row.CustomerId.toString() : row.CustomerNumber);
				row.Name = row.CustomerName;
				var output = "CustomerId: " + row.CustomerId;
				output += "; Name: " + row.Name;
				LogMessage(_moduleName_dataAccess + ": Read " + _TableName_Customer + " - " + output);
				//transfer data to customer list
				resultData.push(row);
			}
			//asynch calls - execute the callback and pass the result set
			LogMessage(_moduleName_dataAccess + ": Read " + _TableName_Customer + " - " + numResults + " row(s) returned");
			onSuccessCallbackFn(resultData);
		}, null);
	});
}

//-----------------------------------------------------------------------------------
//      CREATE local customers data - PhoneGap
//-----------------------------------------------------------------------------------
function DataAccess_CustomerCreate_PHONEGAP(customer) {

	var db = OpenDatabase_PHONEGAP();
	var sql = 'INSERT INTO %%TABLENAME%% (%%COLUMNS%%) VALUES (%%VALUES%%) ';
	var columns =
		'CustomerNumber' +
		',IsLocal' +
		',CustomerName' +
		',Address' +
		',City' +
		',State' +
		',Zip' +
		',Country' +
		',MachineNumber' +
		',SectionCode' +
		',SectionName' +
		',ApplicationCode' +
		',ApplicationName' +
		',PaperGrade' +
		',ImperialMetric' +
		',CreateDate ';
	var values =
		' ?' +
		',?' +
		',?' +
		',?' +
		',?' +
		',?' +
		',?' +
		',?' +
		',?' +
		',?' +
		',?' +
		',?' +
		',?' +
		',?' +
		',?' +
		',?';
	sql = sql.replace('%%TABLENAME%%', _TableName_Customer);
	sql = sql.replace('%%COLUMNS%%', columns);
	sql = sql.replace('%%VALUES%%', values);

	db.transaction(function(tx) {
		tx.executeSql(sql, [
			customer.CustomerNumber,
			1,  //isLocal
			customer.Name,
			customer.Address,
			customer.City,
			customer.State,
			customer.Zip,
			customer.Country,
			customer.MachineNumber,
			customer.SectionCode,
			customer.SectionName,
			customer.ApplicationCode,
			customer.ApplicationName,
			customer.PaperGrade,
			customer.ImperialMetric,
			(new Date()).toLocaleDateString()
			], function (tx, result) {
				alert('Inserted');
				var primaryKey = result.lastInsertRowID;
				LogMessage(_moduleName_dataAccess + ": Insert " + _TableName_Customer + " - one row inserted, id = " + primaryKey);
				return primaryKey;
			},
			function(error){
				alert('Error occurred');
			});
	});
}

//-----------------------------------------------------------------------------------
//      UPDATE local customers data - PhoneGap
//-----------------------------------------------------------------------------------
function DataAccess_CustomerUpdate_PHONEGAP(customer) {
    //not implemented
}

//-----------------------------------------------------------------------------------
//      DELETE local customers data - PhoneGap
//-----------------------------------------------------------------------------------
function DataAccess_CustomerDelete_PHONEGAP(customerId) {
    //not implemented
}

//-----------------------------------------------------------------------------------
//      PHONEGAP - QUOTE HISTORY
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
//      READ local QuoteHistory data - PhoneGap
//-----------------------------------------------------------------------------------
function DataAccess_QuoteRead_PHONEGAP(term, onSuccessCallbackFn) {
	resultData = [];
	var db = OpenDatabase_PHONEGAP();
	var sql = 'SELECT * FROM ' + _TableName_Quote;
	//optional filter
	if (term != undefined && term.length > 0) {
		//revisit this - may have to break out some fields in order to search
		sql += ' WHERE LOWER(CustomerJSON) like "%' + term + '%"';
	}
	//add order by
	sql += ' ORDER BY QuoteId desc';

	var numResults = 0;
	db.transaction(function(tx) {
		tx.executeSql(sql, [], function (tx, result) {
			numResults = result.rows.length;
			for (i = 0; i < numResults; i++) {
				var row = result.rows.item(i);
				LogMessage(_moduleName_dataAccess + ": Read " + _TableName_Quote + " - QuoteId: " + row.QuoteId);
				//transfer data to QuoteHistory list
				resultData.push(TransferQuoteHistoryRowToJSON(row));
			}
				//$("#TableData").append("<tr><td>"+result.rows.item(i).id+"</td><td>"+result.rows.item(i).title+"</td><td>"+result.rows.item(i).desc+"</td></tr>");
			LogMessage(_moduleName_dataAccess + ": Read " + _TableName_Quote + " - " + numResults + " row(s) returned");
			onSuccessCallbackFn(resultData);
		}, null);
	});
}

//-----------------------------------------------------------------------------------
//      CREATE local quote data - PhoneGap
//-----------------------------------------------------------------------------------
function DataAccess_QuoteCreate_PHONEGAP(quote) {

	var db = OpenDatabase_PHONEGAP();
	var sql = 'INSERT INTO %%TABLENAME%% (%%COLUMNS%%) VALUES (%%VALUES%%) ';
	var columns =
		' QuoteDate' +
		',PDFFileName' +
		',OriginalQuoteId' +
		',OriginalQuoteCaption' +
		',CustomerJSON' +
		',ProductJSON' +
		',ProductSelectionJSON' +
		',AppTypeJSON';
	var values =
		' ?' +
		',?' +
		',?' +
		',?' +
		',?' +
		',?' +
		',?' +
		',?';
	sql = sql.replace('%%TABLENAME%%', _TableName_Quote);
	sql = sql.replace('%%COLUMNS%%', columns);
	sql = sql.replace('%%VALUES%%', values);

	db.transaction(function(tx) {
		tx.executeSql(sql, [
			quote.QuoteDate,
			quote.PDFFileName,
			quote.OriginalQuoteId,
			quote.OriginalQuoteCaption,
			JSON.stringify(quote.Customer),
			JSON.stringify(quote.Product),
			JSON.stringify(quote.ProductSelection),
			JSON.stringify(quote.AppType),
			], function (tx, result) {
				alert('Inserted');
				var primaryKey = result.lastInsertRowID;
				LogMessage(_moduleName_dataAccess + ": Insert " + _TableName_Quote + " - one row inserted, id = " + primaryKey);
				return primaryKey;
			},
			function(error){
				alert('Error occurred');
			});
	});
}

//-----------------------------------------------------------------------------------
//      UPDATE local QuoteHistorys data - PhoneGap
//-----------------------------------------------------------------------------------
function DataAccess_QuoteUpdate_PHONEGAP(quote) {
    //not implemented
}

//-----------------------------------------------------------------------------------
//      DELETE local QuoteHistorys data - PhoneGap
//-----------------------------------------------------------------------------------
function DataAccess_QuoteDelete_PHONEGAP(quoteId) {
    //not implemented
}

//-----------------------------------------------------------------------------------
//      SHARED - 
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
//      SHARED - Transfer from sqllite row to Quote array
//-----------------------------------------------------------------------------------
function TransferQuoteHistoryRowToJSON(row) {
    result = {};
    result.QuoteId = row.QuoteId;
    result.OriginalQuoteId = row.OriginalQuoteId;
    result.OriginalQuoteCaption = row.OriginalQuoteCaption;
    result.PDFFileName = row.PDFFileName;
    result.QuoteDate = row.QuoteDate;
    var customer = $.parseJSON(row.CustomerJSON);
    result.Customer = customer;
    var productSelection = $.parseJSON(row.ProductSelectionJSON);
    result.ProductSelection = productSelection;
    var product = $.parseJSON(row.ProductJSON);
    result.Product = product;
    var appType = $.parseJSON(row.AppTypeJSON);
    result.AppType = appType;
    return result;
}

//-----------------------------------------------------------------------------------
//      TEST - basic operations of create, insert, get PK id from insert
//-----------------------------------------------------------------------------------
function DataAccess_TEST_CreateInsert() {
    var conn = Connection_Air();
    var tableNameTest = 'AAAA_TEST';
    //DROP TABLE
    DropTable_AIR(conn, tableNameTest);
    //CREATE TABLE
    var sql =
        "CREATE TABLE IF NOT EXISTS " + tableNameTest + " (" +
        "    AaaaId INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "    AaaaName TEXT, " +
        "    CreateDate TEXT " +
        ")";
    CreateTable_AIR(conn, sql, tableNameTest);

    //INSERT DATA
    var sql = 'INSERT INTO %%TABLENAME%% (%%COLUMNS%%) VALUES (%%VALUES%%) ';
    var columns =
        ' AaaaName' +
        ',CreateDate';
    var values =
    ' :AaaaName' +
    ',:CreateDate';
    sql = sql.replace('%%TABLENAME%%', tableNameTest);
    sql = sql.replace('%%COLUMNS%%', columns);
    sql = sql.replace('%%VALUES%%', values);
    LogMessage(_moduleName_dataAccess + ": TEST - Insert SQL: " + sql);
    var sqlStm = new air.SQLStatement();
    sqlStm.text = sql;
    sqlStm.parameters[":AaaaName"] = 'TEST';
    sqlStm.parameters[":CreateDate"] = (new Date()).toLocaleDateString();
    sqlStm.sqlConnection = conn;
    sqlStm.execute();

    // get the primary key 
    var result = sqlStm.getResult();
    var primaryKey = result.lastInsertRowID;
    var message = "TEST - Insert " + tableNameTest + " - one row inserted, id = " + primaryKey;
    LogMessage(_moduleName_dataAccess + ": " + message);
    ShowMessage("Test DB Insert", message, "error", null);
}

