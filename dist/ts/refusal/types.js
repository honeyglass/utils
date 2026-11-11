/**
 * The shape of a refusal: an error that leaves the code and says who acts next.
 *
 * RefusalText: the text of a refusal; only refusal() makes one.
 * Refusal: the refusal as an object, its kind naming who acts next.
 *
 * A value of either type proves no origin: anyone can build the object or write the text, so
 * neither may decide at a trust boundary.
 *
 * @example if (isRefusal(permissions)) return denied($, permissions)
 */
export {};
