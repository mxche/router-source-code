//记录当前的hash
class HistoryRoute {
  constructor() {
    this.current = null;
  }
}

class VueRouter {
  constructor(opts) {
    this.mode = opts.mode || "hash";
    this.routes = opts.routes;
    this.routesMap = this.createRouteMap(this.routes);
    this.history = new HistoryRoute();
    this.init();
  }
  init() {
    if (this.mode === "hash") {
      // location.hash;
      location.hash ? "" : (location.hash = "/");
      window.addEventListener("load", () => {
        this.history.current = location.hash.slice(1);
      });
      window.addEventListener("hashchange", () => {
        this.history.current = location.hash.slice(1);
      });
    } else {
      location.hash ? "" : (location.hash = "/");
      window.addEventListener("load", () => {
        this.history.current = location.pathname;
      });
      window.addEventListener("popstate", () => {
        this.history.current = location.pathname;
      });
    }
  }
  createRouteMap(routes) {
    return routes.reduce((pathObj, current) => {
      pathObj[current.path] = current.component;
      return pathObj;
    }, {});
  }
}

VueRouter.install = function (Vue) {
  Vue.mixin({
    beforeCreate() {
      //取到当前的根路由，将当前的路由实例保存
      if (this.$options && this.$options.router) {
        this._root = this;
        //当前路由实例
        this._router = this.$options.router;
        // 将history的current变化转成响应式
        Vue.util.defineReactive(this._router.history, "current");
      } else {
        //给子组件添_root,取父级的_root
        this._root = this.$parent && this.$parent._root;
      }
      // 给每一个组件添加$router实例对象和$route参数对象;
      Object.defineProperty(this, "$router", {
        get() {
          return this._root._router;
        },
      });
      Object.defineProperty(this, "$route", {
        get() {
          return this._root._router.history.current;
        },
      });
    },
  });

  Vue.component("router-link", {
    props: {
      to: String,
    },
    render() {
      const mode = this._self._root._router.mode;
      return (
        <a href={mode == "hash" ? `#${this.to}` : this.to}>
          {this.$slots.default}
        </a>
      );
    },
  });
  Vue.component("router-view", {
    render(h) {
      const current = this._self._root._router.history.current;
      const routesMap = this._self._root._router.routesMap;
      return h(routesMap[current]);
    },
  });
};

export default VueRouter;
