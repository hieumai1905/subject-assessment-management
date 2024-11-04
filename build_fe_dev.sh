cd fe
docker build -t trung2305/sep490_fe:domain .
docker push trung2305/sep490_fe:domain
docker rmi -f trung2305/sep490:domain