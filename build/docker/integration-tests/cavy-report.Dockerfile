FROM circleci/node
COPY --chown=circleci tool/cavy_report_server /cavy_report_server
RUN cd /cavy_report_server; npm i
CMD ["/cavy_report_server/server"]
