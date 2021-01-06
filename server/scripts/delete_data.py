from server import db


def delete_data():
    dependency_order = [
        db.Event,
        db.CustomerExperimentAssoc,
        db.Customer,
        db.CampaignVariant,
        db.Experiment,
        db.Campaign,
        db.Variant,
        db.Product,
        db.Shop,
    ]
    for table in dependency_order:
        table.query.delete()
    db.session.commit()


if (__name__ == '__main__'):
    delete_data()
