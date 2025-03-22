from django.http import HttpResponse


def HttpResponseAccelRedirect(path):
	response = HttpResponse()
	response["X-Accel-Redirect"] = "/secureData/" + path
	return response