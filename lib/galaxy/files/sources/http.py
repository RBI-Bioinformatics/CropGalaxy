import logging
import re
import urllib.request

from galaxy.util import DEFAULT_SOCKET_TIMEOUT, get_charset_from_http_headers, stream_to_open_named_file

from . import BaseFilesSource

log = logging.getLogger(__name__)


class HTTPFilesSource(BaseFilesSource):
    plugin_type = "http"

    def __init__(self, label="HTTP File", doc="Default HTTP file handler", **kwd):
        kwds = dict(
            id="_http",
            label=label,
            doc=doc,
            writable=False,
        )
        kwds.update(kwd)
        props = self._parse_common_config_opts(kwds)
        self._url_regex = re.compile(props.pop("url_regex", r"^https?://"))
        assert self._url_regex
        self._props = props

    def _realize_to(self, source_path, native_path, user_context=None):
        props = self._serialization_props(user_context)
        headers = props.pop("http_headers", {}) or {}

        req = urllib.request.Request(source_path, headers=headers)

        with urllib.request.urlopen(req, timeout=DEFAULT_SOCKET_TIMEOUT) as page:
            f = open(native_path, "wb")  # fd will be .close()ed in stream_to_open_named_file
            return stream_to_open_named_file(
                page, f.fileno(), native_path, source_encoding=get_charset_from_http_headers(page.headers)
            )

    def _write_from(self, target_path, native_path, user_context=None):
        raise NotImplementedError()

    def _serialization_props(self, user_context=None):
        effective_props = super()._serialization_props(user_context=user_context)
        effective_props["url_regex"] = self._url_regex
        return effective_props

    def score_url_match(self, url: str):
        match = self._url_regex.match(url)
        if match:
            return match.span()[1]
        else:
            return 0


__all__ = ("HTTPFilesSource",)
