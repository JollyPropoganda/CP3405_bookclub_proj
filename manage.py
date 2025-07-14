import os
import sys

# Add the parent directory (project root) to the PYTHONPATH, so 'Backend' can be imported

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()


#credentials
#username: Backend_Admin (django database)
#email: cp3405db3@gmail.com
#password: DT3b@ckend (email & django database)
