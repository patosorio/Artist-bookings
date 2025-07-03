from django.http import JsonResponse

class FirebaseAuthMiddleware:
    """
    This middleware is kept minimal as authentication is primarily handled by 
    FirebaseAuthentication class for API routes
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)