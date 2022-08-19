function classname(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default classname;
