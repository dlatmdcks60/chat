import AbstractView from "../AbstractView.js";
import load from "./load.js";

export default class extends AbstractView {
  constructor() {
    super();
  }

  getHtml() {
    return new Promise(res => {
      load.page(resData => {
        document.title = resData.data.title;
        res({
          result: resData.result,
          html: resData.data.html,
          title: resData.data.title,
          page_en: resData.data.page.en,
          page_ko: resData.data.page.ko
        });
      });
    });
  }
}