host="election19.samireland.com"

# Empty the current source directory on the server
ssh $host "rm -r ~/$host/source/* >& /dev/null"

# Send git tracked files
rsync -vr . --exclude-from='.gitignore' --exclude='.git' $host:~/$host/source

# Copy secrets
scp core/secrets.py $host:~/$host/source/core/secrets.py

# Turn off debug on server
ssh $host "sed -i s/\"DEBUG = True\"/\"DEBUG = False\"/g ~/$host/source/core/settings.py"

# Add allowed host
ssh $host "sed -i s/\"HOSTS = \[\]\"/\"HOSTS = \['$host'\]\"/g ~/$host/source/core/settings.py"

# Switch database
ssh $host "sed -i s/\"DATABASES = local\"/\"DATABASES = live\"/g ~/$host/source/core/secrets.py"

# Install pip packages
ssh $host "~/$host/env/bin/pip install rcssmin --install-option="--without-c-extensions""
ssh $host "~/$host/env/bin/pip install libsass"
ssh $host "~/$host/env/bin/pip install psycopg2-binary"
ssh $host "~/$host/env/bin/pip install -r ~/$host/source/requirements.txt"

# Apply migrations
ssh $host "~/$host/env/bin/python ~/$host/source/manage.py migrate"

# Move static files
ssh $host "cd ~/$host/source && ../env/bin/python manage.py compilescss"
ssh $host "cd ~/$host/source && ../env/bin/python manage.py collectstatic --noinput"
