def safe_path(path, root):
    root = root.rstrip("/") or "/"
    path = path or "/"
    parts = path.replace("\\", "/").split("/")
    stack = []
    for part in parts:
        if part in ("", "."):
            continue
        if part == "..":
            if stack:
                stack.pop()
            continue
        stack.append(part)
    return root + "/" + "/".join(stack) if stack else root


def normalize_module_name(name):
    if not name:
        return name
    name = name.strip().replace("\\", "/")
    if name.endswith(".py"):
        name = name[:-3]
    stack = []
    for part in name.split("/"):
        if part in ("", "."):
            continue
        if part == "..":
            if stack:
                stack.pop()
            continue
        stack.append(part)
    return "/".join(stack)