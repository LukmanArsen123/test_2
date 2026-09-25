namespace Helpdesk.Api.Exceptions;

public class InvalidStatusTransitionException(string message) : Exception(message);
