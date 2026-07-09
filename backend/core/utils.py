import requests
from django.conf import settings


def is_proxy(ip):

    try:

        response = requests.get(

            f"https://proxycheck.io/v2/{ip}",

            params={
                "key": settings.PROXYCHECK_TOKEN,
                "vpn": 1
            },

            timeout=5

        )

        data = response.json()

        return data[ip]["proxy"] == "yes"

    except:

        return False