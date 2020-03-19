/**
 * 日历插件 date:2020-03-14
 * container 渲染日历容器id
 * year 年
 * month 月
 * day 日期
 * data 指定高亮显示的日期 一般用于显示有数据的日期 数组格式 [1,2,3]
 * lang 语言 zh-cn en
 * click 单击日期事件 
 * before 日历插件渲染之前事件
 * loaded 日历插件加载完成事件
 * init 日历插件初始化方法
 * version  获取插件版本号
 * 静态方法
 * getEl   根据元素id获取元素对象
 * getElByTagName  获取指定元素的对象集合
 * getAttr  获取对象的指定属性的值
 * setAttr  设置对象的指定属性的值
 * */
class CKCalendar {
    /**
     *渲染容器id
     */
    public container: string = "";
    /**
    * 默认年份
    */
    public year: number = 0;
    /**
    * 默认月份
    */
    public month: number = 0;
    /**
    * 默认日期
    */
    public day: number = 0;
    /**
    * 默认带有数据的日期 如 1，2，3
    */
    public data: number[] = [];
    /**
    * 日历语言
    */
    public lang: string = "zh-cn"; //zh-cn en
    /**
    * 点击每天日期(有效日期)执行的事件
    * */
    public click(event: Event): void { };
    /**
    * 日历渲染之前事件
    * */
    public before(): void { };
    /**
    * 日历渲染之后事件
    * */
    public loaded(): void { };
    /**
       * 初始化日历 
       * */
    public init(): void {
        //let self = this;

        //定义周数组
        let chsWeek: Array<string> = new Array("日", "一", "二", "三", "四", "五", "六", "日");
        //private engWeek: Array<string> = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday");
        let engWeek: Array<string> = new Array("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun");

        let container = CKCalendar.getEl(this.container);

        let today = new Date();
        if (this.year == 0)
            this.year = today.getFullYear();

        if (this.day == 0)
            this.day = today.getDate();

        if (this.month == 0)
            this.month = today.getMonth() + 1;

        //获取需要创建的日历基础数据

        let firstday = new Date(this.year + "/" + this.month + "/1").getDay();	    //第一天的星期数。0，周日；1，周一

        let lastDay = new Date(this.year, this.month, 0).getDate();	                //月份最后一天的日期，即本月天数

        let daysCount = lastDay + (firstday + 6) % 7;								//总日数，包含前面补充的"上月最后几天"

        let dayRows = Math.ceil(daysCount / 7);							            //日历总行数。

        //绑定渲染之前事件
        this.beforeEvent();

        //创建日历
        let calHtml: string[] = [];
        let tmp: number, tclass: string;

        calHtml.push('<table  class="calendar" >');

        //星期栏

        calHtml.push('<tr class="week">');

        for (let i = 0; i < 7; i++) {

            tmp = (i + 1) % 7;

            //周日
            if (tmp == 0) {

                tclass = 'week-sun';

            } else if (tmp == 6) { //周六

                tclass = 'week-sat';

            }
            else { //周一至周五

                tclass = '';
            }
            let week: Array<string> = chsWeek;
            if (this.lang == "en") {
                week = engWeek;
            }

            if (tclass == "")
                calHtml.push('<td >' + week[tmp] + '</td>');
            else
                calHtml.push('<td class="' + tclass + '">' + week[tmp] + '</td>');

        }

        calHtml.push('</tr>');

        //日历内容

        for (let i = 0; i < dayRows; i++) {

            calHtml.push('<tr>'); // class="btg"

            for (let j = 0; j < 7; j++) {

                tmp = i * 7 + j + 1 - (firstday + 6) % 7;


                if (tmp < 1 || tmp > lastDay) {

                    calHtml.push('<td >&nbsp;</td>');

                }
                else {

                    calHtml.push('<td>');
                    let vcss: string = "";
                    //日期标签自带年月数据
                    let spandate: string = '" data-year="' + this.year + '" data-month="' + this.month + '"';
                    //$.each(hlist, function () { if (this == tmp) vcss = "date-highlight"; })

                    if (this.data) {
                        for (let i = 0; i < this.data.length; i++) {
                            if (this.data[i] == tmp) {
                                vcss = "date-highlight"
                            };
                        }
                    }

                    if (j != 5 && j != 6) {
                        if (tmp == this.day)
                            calHtml.push('<span class="date-today ' + vcss + '" ' + spandate + ' >' + tmp + '</span>');
                        else {
                            if (vcss == "")
                                calHtml.push('<span ' + spandate + '>' + tmp + '</span>');
                            else
                                calHtml.push('<span class="' + vcss + '" ' + spandate + '>' + tmp + '</span>');
                        }

                    } else if (j == 5) {
                        if (tmp == this.day)
                            calHtml.push('<span class="date-today ' + vcss + '" ' + spandate + '>' + tmp + '</span>');
                        else
                            calHtml.push('<span class="date-sat ' + vcss + '" ' + spandate + '>' + tmp + '</span>');

                    } else if (j == 6) {
                        if (tmp == this.day)
                            calHtml.push('<span class="date-today ' + vcss + '" ' + spandate + '>' + tmp + '</span>');
                        else
                            calHtml.push('<span class="date-sun ' + vcss + '" ' + spandate + '>' + tmp + '</span>');

                    }

                    calHtml.push('</td>');

                }

            }

            calHtml.push('</tr>');

        }

        calHtml.push('</table>');


        container.innerHTML = calHtml.join(' ');

        //绑定事件
        this.loadedEvent();
        this.dayClickEvent();

    }
    /**
     * 日历加载之前事件
     */
    private beforeEvent(): void {
        let _self = this;
        if (_self.before && typeof (_self.before) == 'function') {
            _self.before();
        }
    }
    /**
    * 日历加载完成事件
    */
    private loadedEvent(): void {
        let _self = this;
        if (_self.loaded && typeof (_self.loaded) == 'function') {
            _self.loaded();
        }
    }
    /**
    * 日期单击事件
    */
    private dayClickEvent(): void {
        let _self = this;
        let dayLables: HTMLCollection = CKCalendar.getElByTagName("span");
        if (dayLables) {
            for (var i = 0; i < dayLables.length; i++) {
                dayLables[i].addEventListener("click", function (event) {

                    if (_self.click && typeof (_self.click) == 'function') {
                        _self.click(event);
                    }
                });
            }
        }
    }
    /**
    * 获取插件版本号
    * @return {string} 插件版本号
    * */
    public version(): string {
        return "1.0.0314";
    }
    /**
      * 根据元素id获取元素对象
      * @param {string} id  系统id
      * @return {HTMLElement} 返回一个html元素对象
      */
    public static getEl(id: string): HTMLElement {
        return document.getElementById(id);
    }
    /**
     * 获取指定元素的对象集合
     * @param {string} tagName 元素名称
     * @return {HTMLCollection} 符合要求的对象集合
     */
    public static getElByTagName(tagName: string): HTMLCollection {
        if (!tagName)
            return null;
        return document.getElementsByTagName(tagName);
    }
    /**
       * 获取对象的指定属性的值
       * @param {HTMLElement} element html元素
       * @param {string} attrName 属性名
       * @return {string} 属性值
       */
    public static getAttr(element: HTMLElement, attrName: string): string {
        return element.getAttribute && element.getAttribute(attrName) || "";
    }
    /**
      * 设置对象的指定属性的值
      * @param {HTMLElement} element html元素
      * @param {string} attrName 属性名
      * @param {string} value 属性值
      * @return {boolean} 设置属性值是否成功
      */
    public setAttr(element: HTMLElement, attrName: string, value: string): boolean {
        if (value) {
            element.setAttribute(attrName, value.trim());
            return true;
        }
        else
            return false;
    }

}
