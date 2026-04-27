# Generated manually to align Django's deterministic index names.

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("vaults", "0004_vaultaccess_mfaapprovalrequest"),
    ]

    operations = [
        migrations.RenameIndex(
            model_name="mfaapprovalrequest",
            new_name="vaults_mfaa_request_d14152_idx",
            old_name="vaults_mfaa_request_5ba19b_idx",
        ),
        migrations.RenameIndex(
            model_name="mfaapprovalrequest",
            new_name="vaults_mfaa_secret__90f51a_idx",
            old_name="vaults_mfaa_secret__f12b91_idx",
        ),
        migrations.RenameIndex(
            model_name="mfaapprovalrequest",
            new_name="vaults_mfaa_expires_d0bf05_idx",
            old_name="vaults_mfaa_expires_95b2b8_idx",
        ),
    ]
