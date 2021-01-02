host="election19.samireland.com"

docker-compose build

docker-compose push

ssh $host "mkdir election19"

scp production.yml $host:~/election19/docker-compose.yml
scp secrets.env $host:~/election19/

ssh $host "cd election19 && docker-compose pull"
ssh $host "cd election19 && docker-compose up --remove-orphans -d"
ssh $host "cd election19 && docker network connect bridge election19_nginx_1 2>/dev/null"

ssh $host "rm -r election19"