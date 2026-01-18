const defaultOptions = {
	show: false,
	message: '',
	selector: '#cus-notify',
};
let currentOptions = Object.assign({}, defaultOptions);
function getContext() {
	const pages = getCurrentPages();
	return pages[pages.length - 1];
}
const Notify = (options) => {
	options = Object.assign(Object.assign({}, currentOptions), options);
	const context = options.context || getContext();
	const notify = context.selectComponent(options.selector);
	delete options.context;
	delete options.selector;
	if (notify) {
			notify.setData(options);
			wx.nextTick(() => {
					notify.setData({ show: true });
			});
			//1.5秒后自动关闭
			setTimeout(() => {
					notify.setData({ show: false });
			}, 1500);
	}
	else {
			console.warn('未找到 cus-notify 节点，请确认 selector 及 context 是否正确');
	}
};
Notify.show = (options) => Notify(options);
export default Notify;

