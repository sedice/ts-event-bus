type Handler<T = any> = (val: T) => void;

class EventBus<Events extends Record<string, any>> {
  private map: Map<string, Set<Handler>> = new Map();

  /**
   * 订阅事件
   * @param name 事件名
   * @param handler 事件处理函数
   */
  on<EventName extends keyof Events>(
    name: EventName,
    handler: Handler<Events[EventName]>
  ) {
    let set: Set<Handler<Events[EventName]>> | undefined = this.map.get(
      name as string
    );
    if (!set) {
      set = new Set();
      this.map.set(name as string, set);
    }
    set.add(handler);
  }

  /**
   * 触发事件
   * @param name 事件名
   * @param handler 事件处理函数
   */
  emit<EventName extends keyof Events>(
    name: EventName,
    value: Events[EventName]
  ) {
    const set: Set<Handler<Events[EventName]>> | undefined = this.map.get(
      name as string
    );
    if (!set) return;
    const copied = [...set];
    copied.forEach((fn) => fn(value));
  }
  /**
   *  清除所有事件
   */
  off(): void;
  /**
   * 清除同名事件
   * @param name 事件名
   */
  off<EventName extends keyof Events>(name: EventName): void;
  /**
   * 清除指定事件
   * @param name 事件名
   * @param handler 处理函数
   */
  off<EventName extends keyof Events>(
    name: EventName,
    handler: Handler<Events[EventName]>
  ): void;

  off<EventName extends keyof Events>(
    name?: EventName,
    handler?: Handler<Events[EventName]>
  ): void {
    // 什么都不传，则清除所有事件
    if (!name) {
      this.map.clear();
      return;
    }

    // 只传名字，则清除同名事件
    if (!handler) {
      this.map.delete(name as string);
      return;
    }

    // name 和 handler 都传了，则清除指定handler
    const handlers: Set<Handler<Events[EventName]>> | undefined = this.map.get(
      name as string
    );
    if (!handlers) {
      return;
    }
    handlers.delete(handler);
  }
}

const bus = new EventBus<{
  foo: string;
  bar: number;
}>();

// 测试传2个参数的情况
const handlerFoo1 = (val: string) => {
  console.log("2个参数 handlerFoo1 => ", val);
};
bus.on("foo", handlerFoo1);
bus.emit("foo", "hello");
// 打印 2个参数 handlerFoo1 => hello
bus.off("foo", handlerFoo1);
bus.emit("foo", "hello");
// 什么都没打印

// 测试传1个参数的情况
const handlerFoo2 = (val: string) => {
  console.log("1个参数 handlerFoo2 => ", val);
};
const handlerFoo3 = (val: string) => {
  console.log("1个参数 handlerFoo3 => ", val);
};
bus.on("foo", handlerFoo2);
bus.on("foo", handlerFoo3);

bus.emit("foo", "hello");
// 打印 1个参数 handlerFoo2 => hello
// 打印 1个参数 handlerFoo3 => hello
bus.off("foo");
bus.emit("foo", "hello");
// 什么都没输出

// 测试传0个参数的情况
const handlerFoo4 = (val: string) => {
  console.log("0个参数 handlerFoo4 => ", val);
};
const handlerBar1 = (val: number) => {
  console.log("0个参数 handlerBar1 => ", val);
};
bus.on("foo", handlerFoo4);
bus.on("bar", handlerBar1);

bus.emit("foo", "hello");
bus.emit("bar", 123);
// 打印 1个参数 handlerFoo4 => hello
// 打印 1个参数 handlerBar1 => 123
bus.off();
bus.emit("foo", "hello");
bus.emit("bar", 123);
// 什么都没输出
