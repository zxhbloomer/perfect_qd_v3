export default {
  priority: 700,
  bind(el, binding, vnode) {
    vnode.context.event = event => vnode.context.$emit(binding.expression, event)
    el.addEventListener('click', event.stopPropagation())
    document.body.addEventListener('click', binding.value)
  },
  unbind(el, binding) {
    el.removeEventListener('click', event.stopPropagation())
    document.body.removeEventListener('click', binding.value)
  }
}
