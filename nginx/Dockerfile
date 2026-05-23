FROM nginx:alpine

# Remove default configurations if any
RUN rm -rf /etc/nginx/conf.d/* /etc/nginx/nginx.conf

# Copy custom nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
