//=============================================================================
// GR_ItemQuantityDisplay.js
// 作成者     :げれげれ 
// 作成日     : 2021/03/05
// 最終更新日 : 2021/03/05
// バージョン : v1.0.0
// ----------------------------------------------------------------------------
// Released under the MIT License.
// https://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 
 * @author げれげれ
 *
 * @param unit
 * @type string
 * @desc 単位
 * @default 個
 *
 * @help
 * メニュー画面からアクターに対しアイテムを使用する際に
 * アイテム名と残数を表示します。
 * 基本的にはプラグイン登録するだけで使えます。
 * 
 *【プラグインパラメータ】
 * アイテム残数を数える単位を変更できます。
 * デフォルトは「個」です。
 * 例「1個」→「1つ」
 * 
 */

//==============================================================================

(function() {
'use strict';

/* プラグインパラメータ */
const PARAMETERS = PluginManager.parameters('GR_ItemQuantityDisplay');
const UNIT = PARAMETERS['unit'];

//シーン関連
const Scene_Item_create = Scene_Item.prototype.create;
Scene_Item.prototype.create = function() {
    Scene_Item_create.call(this);
    this.createQuantityWindow();
};

Scene_Item.prototype.createQuantityWindow = function() {
    this._quantityWindow = new Window_Quantity(this);
    this._quantityWindow.hide();
    this.addWindow(this._quantityWindow);
};

Scene_Item.prototype.determineItem = function() {
    let action = new Game_Action(this.user());
    let item = this.item();
    action.setItemObject(item);
    if (action.isForFriend()) {
        this.showSubWindow(this._actorWindow);
        this._actorWindow.selectForItem(this.item());
        //quantityWindowをここで表示
        this.showQuantityWindow(this._quantityWindow, this._actorWindow.width);
    } else {
        this.useItem();
        this.activateItemWindow();
    }
};

Scene_ItemBase.prototype.showQuantityWindow = function(window, actorWindowWidth) {
    window.x = this.isCursorLeft() ? 0 : actorWindowWidth;
    window.refresh();
    window.show();
    window.activate();
};

const Scene_ItemBase_onActorOk = Scene_ItemBase.prototype.onActorOk;
Scene_Item.prototype.onActorOk = function() {
    Scene_ItemBase_onActorOk.call(this);
    this._quantityWindow.refresh();
};

const Scene_ItemBase_onActorCancel = Scene_ItemBase.prototype.onActorCancel;
Scene_Item.prototype.onActorCancel = function() {
    this._quantityWindow.hide();
    Scene_ItemBase_onActorCancel.call(this);
};


//Window関連
function Window_Quantity() {
    this.initialize.apply(this, arguments);
}

Window_Quantity.prototype = Object.create(Window_Base.prototype);
Window_Quantity.prototype.constructor = Window_Quantity;

Window_Quantity.prototype.initialize = function(parentScene) {
    this._parentScene = parentScene;
    const width = this.windowWidth();
    const height = this.windowHeight();
    Window_Base.prototype.initialize.call(this, 0, 0, width, height);
};

Window_Quantity.prototype.windowWidth = function() {
    return Graphics.boxWidth - this._parentScene._actorWindow.width;
};

Window_Quantity.prototype.windowHeight = function() {
    return this.fittingHeight(2);
};

Window_Quantity.prototype.refresh = function() {
    const x = this.textPadding();
    const y = this.lineHeight();
    const width = this.contents.width - this.textPadding() * 2;
    const item = this._parentScene.item();
    const value = this.itemQuantity(item);
    this.contents.clear();
    this.drawItemName(item, x, 0, width);
    this.drawCurrencyValue(value, UNIT, x, y, width);
};

Window_Quantity.prototype.itemQuantity = function(item) {
    return $gameParty.numItems(item);
};

})();